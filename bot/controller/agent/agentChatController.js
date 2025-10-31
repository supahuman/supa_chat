import { getGlobalModel } from '../../config/globalModel.js';
import Agent from '../../models/agentModel.js';
import VectorStoreService from '../../services/nlp/VectorStoreService.js';
import ToolExecutionService from '../../services/tools/ToolExecutionService.js';
import ConversationService from '../../services/conversation/ConversationService.js';
import LLMFactory from '../../services/llm/LLMFactory.js';
import KnowledgeResponseService from '../../services/KnowledgeResponseService.js';

class AgentChatController {
  constructor() {
    this.vectorStoreService = new VectorStoreService();
    this.toolExecutionService = new ToolExecutionService();
    this.conversationService = new ConversationService();
    this.knowledgeResponseService = KnowledgeResponseService;
  }

  /**
   * Chat with a specific agent using their knowledge base and tools
   * POST /api/company/agents/:agentId/chat
   */
  async chatWithAgent(req, res) {
    try {
      const { agentId } = req.params;
      const { message, sessionId, conversationHistory = [] } = req.body;
      const { companyId, userId } = req.company;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      console.log(`💬 Chatting with agent ${agentId} for company ${companyId}`);

      // Get the agent
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      // 1. Search knowledge base for relevant content with confidence scoring
      let knowledgeContext = '';
      let confidence = { score: 0, level: 'none', count: 0, averageSimilarity: 0 };
      
      try {
        const searchResults = await this.vectorStoreService.searchSimilarContent(
          agentId,
          companyId,
          message,
          { limit: 5, threshold: 0.3 }
        );

        if (searchResults.length > 0) {
          knowledgeContext = searchResults.map(result => result.content).join('\n\n');
          confidence = this.knowledgeResponseService.calculateConfidence(searchResults);
          console.log(`📚 Found ${searchResults.length} relevant knowledge chunks (confidence: ${confidence.level}, score: ${(confidence.score * 100).toFixed(0)}%)`);
        } else {
          console.log('📚 No relevant knowledge found for this query');
        }
      } catch (error) {
        console.error('❌ Knowledge search error:', error);
        // Continue without knowledge context
      }

      // 1b. Agentic RAG fallback: if low confidence, fetch from KB URLs live
      try {
        if (!knowledgeContext || (confidence?.score ?? 0) < 0.5) {
          const { docsSearch } = (await import('../../services/tools/docsSearchService.js')).default;
          const live = await docsSearch(agentId, companyId, message, { maxUrls: 2, timeoutMs: 2000, loopAll: true });
          if (live?.snippets?.length) {
            knowledgeContext += '\n\n' + live.snippets.slice(0, 4).join('\n\n');
            // bump perceived confidence slightly
            confidence = confidence || {}; 
            confidence.score = Math.max(confidence.score || 0, 0.5);
            confidence.level = confidence.score >= 0.7 ? 'high' : 'medium';
          }
        }
      } catch (e) {
        console.warn('⚠️ docs-search fallback failed', e?.message);
      }

      // 2. Check if any tools should be executed
      let toolResults = '';
      if (agent.tools?.enabled?.length > 0) {
        try {
          // Simple tool detection based on keywords
          const toolTriggers = {
            'onedrive': ['save', 'store', 'document', 'file'],
            'slack': ['message', 'notify', 'team', 'channel'],
            'email': ['send', 'email', 'notify'],
            'ticket': ['ticket', 'support', 'issue', 'problem'],
            'callback': ['call', 'callback', 'phone', 'schedule'],
            'docs': ['documentation', 'help', 'guide', 'manual'],
            'update': ['update', 'modify', 'change', 'edit'],
            'refund': ['refund', 'return', 'money', 'payment'],
            'escalate': ['escalate', 'manager', 'supervisor', 'urgent'],
            'survey': ['survey', 'feedback', 'rating', 'review']
          };

          const messageLower = message.toLowerCase();
          const triggeredTools = [];

          for (const [toolId, keywords] of Object.entries(toolTriggers)) {
            if (agent.tools.enabled.includes(toolId) && 
                keywords.some(keyword => messageLower.includes(keyword))) {
              triggeredTools.push(toolId);
            }
          }

          if (triggeredTools.length > 0) {
            console.log(`🔧 Triggered tools: ${triggeredTools.join(', ')}`);
            
            // Execute the first triggered tool
            const toolId = triggeredTools[0];
            const toolParams = { message, sessionId, userId };
            
            const toolResult = await this.toolExecutionService.executeTool(
              toolId, 
              toolParams, 
              { agentId, companyId, userId, agent }
            );

            if (toolResult.success) {
              toolResults = `\n\n[Tool executed: ${toolId}] ${toolResult.message || 'Action completed'}`;
            }
          }
        } catch (error) {
          console.error('❌ Tool execution error:', error);
          // Continue without tool results
        }
      }

      // 3. Generate response using LLM with enhanced context
      const globalModel = getGlobalModel();
      const apiKey = globalModel.provider === 'groq' ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;
      const llm = LLMFactory.create(globalModel.provider, {
        apiKey: apiKey,
        model: globalModel.model,
        temperature: globalModel.temperature,
        maxTokens: globalModel.maxTokens
      });
      
      await llm.initialize();
      
      // Generate enhanced system prompt with knowledge enforcement
      const systemPrompt = this.knowledgeResponseService.generateSystemPrompt(
        agent,
        knowledgeContext,
        confidence,
        toolResults
      );

      const userPrompt = `User message: ${message}

${conversationHistory.length > 0 ? `Previous conversation context:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}` : ''}`;

      const llmResponse = await llm.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const response = llmResponse.success ? llmResponse.content : 'I apologize, but I\'m having trouble processing your request right now.';

      // 4. Save conversation
      try {
        await this.conversationService.addMessage(sessionId, {
          role: 'user',
          content: message,
          agentId,
          companyId,
          userId
        });

        await this.conversationService.addMessage(sessionId, {
          role: 'assistant',
          content: response,
          agentId,
          companyId,
          userId
        });
      } catch (error) {
        console.error('❌ Conversation save error:', error);
        // Continue even if conversation saving fails
      }

      // 5. Update agent usage stats
      try {
        await Agent.findByIdAndUpdate(agent._id, {
          $inc: { 
            'usage.totalMessages': 1,
            'usage.totalConversations': conversationHistory.length === 0 ? 1 : 0
          },
          $set: { 'usage.lastUsed': new Date() }
        });
      } catch (error) {
        console.error('❌ Stats update error:', error);
      }

      // Generate enhanced response metadata
      const responseMetadata = this.knowledgeResponseService.generateResponseMetadata(
        confidence,
        knowledgeContext ? true : false,
        toolResults ? true : false
      );

      res.json({
        success: true,
        response,
        agentId,
        sessionId,
        ...responseMetadata
      });

    } catch (error) {
      console.error('❌ Agent chat error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message'
      });
    }
  }

  /**
   * Get conversation history for an agent
   * GET /api/company/agents/:agentId/conversations/:sessionId
   */
  async getConversation(req, res) {
    try {
      const { agentId, sessionId } = req.params;
      const { companyId } = req.company;

      // Verify agent exists and belongs to company
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      const conversation = await this.conversationService.getConversation(sessionId);
      
      res.json({
        success: true,
        data: conversation
      });

    } catch (error) {
      console.error('❌ Get conversation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get conversation'
      });
    }
  }

  /**
   * Chat with agent using agent API key (for embed widget)
   * POST /api/agent/chat
   */
  async chatWithAgentByApiKey(req, res) {
    try {
      const { message, sessionId, conversationHistory = [] } = req.body;
      const { agentId, companyId, userId } = req; // From authenticateAgentApiKey middleware

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      // Get the agent (already validated by middleware)
      const agent = req.agent;

      // Get relevant knowledge from vector store
      const relevantKnowledge = await this.vectorStoreService.searchSimilarContent(
        agentId,
        companyId,
        message,
        { limit: 5, threshold: 0.3 }
      );

      // Get conversation context
      let conversation = null;
      if (sessionId) {
        conversation = await this.conversationService.getConversation(sessionId, agentId, companyId);
      }

      // Prepare context for LLM
      const context = {
        agent,
        message,
        relevantKnowledge,
        conversationHistory: conversationHistory.length > 0 ? conversationHistory : (conversation?.messages || []),
        sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Generate response using LLM with enhanced context
      const globalModel = getGlobalModel();
      const apiKey = globalModel.provider === 'groq' ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;
      const llm = LLMFactory.create(globalModel.provider, {
        apiKey: apiKey,
        model: globalModel.model,
        temperature: globalModel.temperature,
        maxTokens: globalModel.maxTokens
      });
      
      await llm.initialize();
      
      // Calculate confidence from search results
      const confidence = this.knowledgeResponseService.calculateConfidence(relevantKnowledge);
      
      // Build knowledge context
      let knowledgeContext = '';
      if (relevantKnowledge && relevantKnowledge.length > 0) {
        knowledgeContext = relevantKnowledge.map(item => 
          `Source: ${item.source || 'Knowledge Base'}\nContent: ${item.content}`
        ).join('\n\n');
      }
      
      // Generate enhanced system prompt with knowledge enforcement
      const systemPrompt = this.knowledgeResponseService.generateSystemPrompt(
        agent,
        knowledgeContext,
        confidence,
        '' // No tool results for embed widget
      );

      const userPrompt = `User message: ${message}

${conversationHistory.length > 0 ? `Previous conversation context:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}` : ''}`;

      const llmResponse = await llm.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const response = llmResponse.success ? llmResponse.content : 'I apologize, but I\'m having trouble processing your request right now.';

      // Save conversation
      await this.conversationService.addMessage(
        context.sessionId,
        agentId,
        companyId,
        userId,
        message,
        response,
        'user'
      );

      await this.conversationService.addMessage(
        context.sessionId,
        agentId,
        companyId,
        userId,
        response,
        response,
        'assistant'
      );

      res.json({
        success: true,
        data: {
          message: response,
          sessionId: context.sessionId,
          sources: relevantKnowledge || [],
          confidence: confidence.score || 0.8
        }
      });
    } catch (error) {
      console.error('❌ Error in chatWithAgentByApiKey:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message'
      });
    }
  }

  /**
   * Get conversation history using agent API key (for embed widget)
   * GET /api/agent/conversations/:sessionId
   */
  async getConversationByApiKey(req, res) {
    try {
      const { sessionId } = req.params;
      const { agentId, companyId, userId } = req; // From authenticateAgentApiKey middleware

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      // Get conversation history
      const conversation = await this.conversationService.getConversation(sessionId, agentId, companyId);
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('❌ Error in getConversationByApiKey:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get conversation'
      });
    }
  }

  /**
   * Helper method to process chat message (shared logic)
   */
  async processChatMessage({ agent, agentId, companyId, userId, message, sessionId, conversationHistory }) {
    try {
      // Get relevant knowledge from vector store
      const relevantKnowledge = await this.vectorStoreService.searchSimilarContent(
        agentId,
        companyId,
        message,
        { limit: 5, threshold: 0.7 }
      );

      // Get conversation context
      let conversation = null;
      if (sessionId) {
        conversation = await this.conversationService.getConversation(sessionId, agentId, companyId);
      }

      // Prepare context for LLM
      const context = {
        agent,
        message,
        relevantKnowledge,
        conversationHistory: conversationHistory.length > 0 ? conversationHistory : (conversation?.messages || []),
        sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Generate response using knowledge response service
      const response = await this.knowledgeResponseService.generateResponse(context);

      // Save conversation
      await this.conversationService.addMessage(
        context.sessionId,
        agentId,
        companyId,
        userId,
        message,
        response.message,
        'user'
      );

      await this.conversationService.addMessage(
        context.sessionId,
        agentId,
        companyId,
        userId,
        response.message,
        response.message,
        'assistant'
      );

      return {
        success: true,
        data: {
          message: response.message,
          sessionId: context.sessionId,
          sources: response.sources || [],
          confidence: response.confidence || 0.8
        }
      };
    } catch (error) {
      console.error('❌ Error processing chat message:', error);
      throw error;
    }
  }
}

export default new AgentChatController();
