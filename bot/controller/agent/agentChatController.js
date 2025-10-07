import Agent from '../../models/agent.js';
import VectorStoreService from '../../services/nlp/VectorStoreService.js';
import ToolExecutionService from '../../services/tools/ToolExecutionService.js';
import ConversationService from '../../services/conversation/ConversationService.js';
import LLMFactory from '../../services/llm/LLMFactory.js';

class AgentChatController {
  constructor() {
    this.vectorStoreService = new VectorStoreService();
    this.toolExecutionService = new ToolExecutionService();
    this.conversationService = new ConversationService();
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

      // 1. Search knowledge base for relevant content
      let knowledgeContext = '';
      try {
        const searchResults = await this.vectorStoreService.searchSimilarContent(
          agentId,
          companyId,
          message,
          { limit: 5, threshold: 0.7 }
        );

        if (searchResults.length > 0) {
          knowledgeContext = searchResults.map(result => result.content).join('\n\n');
          console.log(`📚 Found ${searchResults.length} relevant knowledge chunks`);
        }
      } catch (error) {
        console.error('❌ Knowledge search error:', error);
        // Continue without knowledge context
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

      // 3. Generate response using LLM with context
      const llm = LLMFactory.create('openai', {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-3.5-turbo'
      });
      
      await llm.initialize();
      
      const systemPrompt = `You are ${agent.name}, an AI assistant with the following personality:
${agent.personality}

${agent.description ? `Description: ${agent.description}` : ''}

${knowledgeContext ? `Relevant knowledge from your knowledge base:
${knowledgeContext}` : ''}

${toolResults ? `Tool execution results:
${toolResults}` : ''}

Respond to the user's message in character, using your personality and the provided knowledge. Be helpful, accurate, and engaging.`;

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

      res.json({
        success: true,
        response,
        agentId,
        sessionId,
        knowledgeUsed: knowledgeContext ? true : false,
        toolsExecuted: toolResults ? true : false,
        confidence: 0.9
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
}

export default new AgentChatController();
