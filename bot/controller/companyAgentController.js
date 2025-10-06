import Agent from '../models/Agent.js';
import Conversation from '../models/Conversation.js';
import { getGlobalModel } from '../config/globalModel.js';
import AgentCrawlerService from '../services/nlp/AgentCrawlerService.js';
import VectorStoreService from '../services/nlp/VectorStoreService.js';
import NLPPipeline from '../services/nlp/NLPPipeline.js';

class CompanyAgentController {
  constructor() {
    this.initialized = true;
  }

  /**
   * Create a new agent for a company
   */
  async createAgent(req, res) {
    try {
      const { companyId, userId } = req;
      const { name, description, personality, knowledgeBase, trainingExamples } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent name is required' 
        });
      }
      
      // Generate unique agent ID
      const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get global model configuration
      const globalModel = getGlobalModel();
      
      // Create agent
      const agent = new Agent({
        agentId,
        companyId,
        createdBy: userId,
        name,
        description: description || 'AI Agent created with Agent Builder',
        personality: personality || 'friendly and helpful',
        knowledgeBase: knowledgeBase || [],
        trainingExamples: trainingExamples || [],
        model: globalModel,
        status: 'active'
      });
      
      await agent.save();
      
      console.log(`✅ Created agent: ${name} (${agentId}) for company: ${companyId}`);
      
      // Trigger NLP pipeline for URLs in knowledge base
      if (knowledgeBase && knowledgeBase.length > 0) {
        const urls = knowledgeBase.filter(item => item.url).map(item => item.url);
        if (urls.length > 0) {
          console.log(`🕷️ Triggering NLP pipeline for ${urls.length} URLs`);
          try {
            await this.processKnowledgeBase(agentId, companyId, urls);
          } catch (error) {
            console.error('❌ Error processing knowledge base:', error);
            // Don't fail the agent creation if NLP processing fails
          }
        }
      }
      
      res.status(201).json({ 
        success: true, 
        data: agent 
      });
    } catch (error) {
      console.error('❌ Error creating agent:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create agent' 
      });
    }
  }

  /**
   * Get all agents for a company
   */
  async getAgents(req, res) {
    try {
      const { companyId } = req;
      
      const agents = await Agent.find({ 
        companyId, 
        status: { $ne: 'deleted' } 
      }).sort({ createdAt: -1 });
      
      res.json({ 
        success: true, 
        data: agents 
      });
    } catch (error) {
      console.error('❌ Error getting agents:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get agents' 
      });
    }
  }

  /**
   * Get a specific agent
   */
  async getAgent(req, res) {
    try {
      const { companyId } = req;
      const { agentId } = req.params;
      
      const agent = await Agent.findOne({ 
        agentId, 
        companyId 
      });
      
      if (!agent) {
        return res.status(404).json({ 
          success: false, 
          error: 'Agent not found' 
        });
      }
      
      res.json({ 
        success: true, 
        data: agent 
      });
    } catch (error) {
      console.error('❌ Error getting agent:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get agent' 
      });
    }
  }

  /**
   * Update an agent
   */
  async updateAgent(req, res) {
    try {
      const { companyId } = req;
      const { agentId } = req.params;
      const updateData = req.body;
      
      const agent = await Agent.findOneAndUpdate(
        { agentId, companyId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
      
      if (!agent) {
        return res.status(404).json({ 
          success: false, 
          error: 'Agent not found' 
        });
      }
      
      console.log(`✅ Updated agent: ${agentId} for company: ${companyId}`);
      
      // Trigger NLP pipeline for new URLs in knowledge base
      if (updateData.knowledgeBase && updateData.knowledgeBase.length > 0) {
        const urls = updateData.knowledgeBase.filter(item => item.url).map(item => item.url);
        if (urls.length > 0) {
          console.log(`🕷️ Triggering NLP pipeline for ${urls.length} URLs in updated agent`);
          try {
            await this.processKnowledgeBase(agentId, companyId, urls);
          } catch (error) {
            console.error('❌ Error processing knowledge base:', error);
            // Don't fail the agent update if NLP processing fails
          }
        }
      }
      
      res.json({ 
        success: true, 
        data: agent 
      });
    } catch (error) {
      console.error('❌ Error updating agent:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update agent' 
      });
    }
  }

  /**
   * Delete an agent
   */
  async deleteAgent(req, res) {
    try {
      const { companyId } = req;
      const { agentId } = req.params;
      
      const agent = await Agent.findOneAndUpdate(
        { agentId, companyId },
        { status: 'deleted', updatedAt: new Date() },
        { new: true }
      );
      
      if (!agent) {
        return res.status(404).json({ 
          success: false, 
          error: 'Agent not found' 
        });
      }
      
      console.log(`✅ Deleted agent: ${agentId} for company: ${companyId}`);
      
      res.json({ 
        success: true, 
        message: 'Agent deleted successfully' 
      });
    } catch (error) {
      console.error('❌ Error deleting agent:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete agent' 
      });
    }
  }

  /**
   * Chat with an agent
   */
  async chatWithAgent(req, res) {
    try {
      const { companyId, userId } = req;
      const { agentId } = req.params;
      const { message, sessionId, personality, conversationHistory } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Message is required' 
        });
      }
      
      // Get or create agent
      let agent = null;
      if (agentId) {
        agent = await Agent.findOne({ agentId, companyId });
      }
      
      const agentPersonality = agent?.personality || personality || 'friendly and helpful';
      
      // Search knowledge base for relevant content
      let knowledgeContext = '';
      if (agent) {
        try {
          const vectorStoreService = new VectorStoreService();
          const searchResults = await vectorStoreService.searchSimilarContent(
            agentId,
            companyId,
            message,
            { limit: 3, threshold: 0.3 } // Reduced limit to prevent overwhelming the prompt
          );

          if (searchResults.length > 0) {
            // Truncate knowledge context to prevent prompt overflow
            knowledgeContext = searchResults
              .map(result => result.content.substring(0, 500)) // Limit each chunk to 500 chars
              .join('\n\n')
              .substring(0, 2000); // Total limit of 2000 chars
            console.log(`📚 Found ${searchResults.length} relevant knowledge chunks for agent ${agentId}`);
          }
        } catch (error) {
          console.error('❌ Knowledge search error:', error);
          // Continue without knowledge context
        }
      }
      
      // Get or create conversation
      let conversation = await Conversation.findOne({ sessionId });
      if (!conversation) {
        conversation = new Conversation({
          sessionId,
          userId,
          companyId,
          agentId: agent?.agentId || null,
          messages: [],
          status: 'active'
        });
      }
      
      // Add user message
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      
      // Keep only last 10 messages for context
      if (conversation.messages.length > 10) {
        conversation.messages = conversation.messages.slice(-10);
      }
      
      conversation.metrics.messageCount = conversation.messages.length;
      conversation.updatedAt = new Date();
      
      // Generate AI response
      const conversationContext = conversation.messages.slice(0, -1)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      const systemPrompt = `You are ${agent?.name || 'an AI assistant'} with the following personality: ${agentPersonality}

${agent?.description ? `Description: ${agent.description}` : ''}

${knowledgeContext ? `Relevant knowledge from your knowledge base:
${knowledgeContext}` : ''}

Your role is to help customers with their questions and provide helpful, accurate responses. Be conversational and maintain your personality throughout the conversation.

Previous conversation context:
${conversationContext || 'No previous context'}

IMPORTANT: Keep responses concise (under 200 words). Do not use asterisks (*) or markdown formatting. Be direct and helpful.`;

      // Use global model for response generation
      const globalModel = getGlobalModel();
      const LLMFactory = (await import('../services/llm/LLMFactory.js')).default;
      const llm = LLMFactory.create(globalModel.provider, {
        apiKey: process.env[`${globalModel.provider.toUpperCase()}_API_KEY`],
        model: globalModel.model,
        temperature: globalModel.temperature,
        maxTokens: globalModel.maxTokens
      });
      
      await llm.initialize();
      
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ];
      
      let response;
      let cleanedContent;
      
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('LLM generation timeout')), 30000)
        );
        
        response = await Promise.race([
          llm.generateResponse(messages),
          timeoutPromise
        ]);
        
        // Clean and filter the response
        cleanedContent = response.content
          .replace(/\*+/g, '') // Remove asterisks
          .replace(/#+/g, '') // Remove hash symbols
          .replace(/_{2,}/g, '') // Remove underscores
          .replace(/\n{3,}/g, '\n\n') // Limit multiple newlines
          .trim();
          
        // Check for error messages from the LLM
        if (cleanedContent.toLowerCase().includes('apologize') && 
            cleanedContent.toLowerCase().includes('trouble processing')) {
          console.log('⚠️ LLM returned error message, using fallback response');
          cleanedContent = 'I understand your question. Let me help you with that. Could you please rephrase your question or provide more details?';
        }
        
        // Check for empty or very short responses
        if (!cleanedContent || cleanedContent.length < 10) {
          console.log('⚠️ LLM returned empty/short response, using fallback');
          cleanedContent = 'I understand your question. Let me help you with that. Could you please rephrase your question or provide more details?';
        }
        
      } catch (llmError) {
        console.error('❌ LLM generation error:', llmError.message);
        
        // Try a simpler fallback prompt
        try {
          const simpleMessages = [
            { role: 'system', content: 'You are a helpful AI assistant. Respond briefly and helpfully.' },
            { role: 'user', content: message }
          ];
          
          const fallbackResponse = await llm.generateResponse(simpleMessages);
          cleanedContent = fallbackResponse.content
            .replace(/\*+/g, '')
            .replace(/#+/g, '')
            .replace(/_{2,}/g, '')
            .trim();
            
          if (!cleanedContent || cleanedContent.length < 10) {
            throw new Error('Fallback also failed');
          }
        } catch (fallbackError) {
          console.error('❌ Fallback generation also failed:', fallbackError.message);
          cleanedContent = 'I understand your question. Let me help you with that. Could you please rephrase your question or provide more details?';
        }
      }
      
      // Add AI response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: cleanedContent,
        timestamp: new Date()
      });
      
      // Update agent usage stats
      if (agent) {
        agent.usage.totalConversations += 1;
        agent.usage.totalMessages += 2; // user + assistant message
        agent.usage.lastUsed = new Date();
        await agent.save();
      }
      
      // Save conversation
      await conversation.save();
      
      console.log(`✅ Chat response generated for session: ${sessionId}`);
      
      res.json({ 
        success: true, 
        response: cleanedContent,
        agentId: agent?.agentId,
        personality: agentPersonality,
        conversationId: sessionId
      });
    } catch (error) {
      console.error('❌ Error in chat:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate response' 
      });
    }
  }

  /**
   * Add knowledge base item to an agent
   */
  async addKnowledgeItem(req, res) {
    try {
      const { companyId } = req;
      const { agentId } = req.params;
      const { type, title, content, url, fileName, fileSize, question, answer } = req.body;
      
      if (!agentId || !type) {
        return res.status(400).json({ 
          success: false, 
          error: 'Agent ID and type are required' 
        });
      }
      
      // Find the agent
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({ 
          success: false, 
          error: 'Agent not found' 
        });
      }
      
      // Create knowledge base item
      const knowledgeItem = {
        id: Date.now().toString(),
        title: title || 'Untitled',
        type,
        content,
        url,
        fileName,
        fileSize,
        question,
        answer,
        status: 'saved',
        createdAt: new Date()
      };
      
      // Add to agent's knowledge base
      agent.knowledgeBase.push(knowledgeItem);
      await agent.save();
      
      console.log(`✅ Added ${type} knowledge item to agent ${agentId}`);
      
      // If it's a URL, trigger NLP processing
      if (type === 'url' && url) {
        try {
          console.log(`🕷️ Triggering NLP processing for URL: ${url}`);
          await this.processKnowledgeBase(agentId, companyId, [url]);
        } catch (error) {
          console.error('❌ Error processing URL:', error);
          // Don't fail the request if NLP processing fails
        }
      }
      
      res.json({ 
        success: true, 
        data: knowledgeItem,
        message: type === 'url' ? 'URL added and processing started' : 'Knowledge item added successfully'
      });
      
    } catch (error) {
      console.error('❌ Error adding knowledge item:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to add knowledge item' 
      });
    }
  }

  /**
   * Process knowledge base through NLP pipeline
   */
  async processKnowledgeBase(agentId, companyId, urls) {
    try {
      if (!urls || urls.length === 0) {
        console.log('No URLs to process');
        return;
      }

      console.log(`🔄 Starting NLP processing for ${urls.length} URLs`);
      
      // Use AgentCrawlerService to crawl URLs
      const crawler = AgentCrawlerService; // Use the singleton instance
      const crawledContent = [];
      
      for (const url of urls) {
        try {
          console.log(`🕷️ Crawling: ${url}`);
          const result = await crawler.crawlWithLangChain(url); // Use correct method name
          if (result) {
            crawledContent.push(result);
            console.log(`✅ Crawled: ${url} - ${result.content?.length || 0} chars`);
          } else {
            console.log(`❌ Failed to crawl: ${url}`);
          }
        } catch (error) {
          console.error(`❌ Error crawling ${url}:`, error.message);
        }
      }
      
      if (crawledContent.length === 0) {
        console.log('No content crawled, skipping NLP processing');
        return;
      }
      
      // Process through NLP pipeline
      const nlpPipeline = new NLPPipeline();
      
      const result = await nlpPipeline.processCrawledContent(
        agentId,
        companyId,
        crawledContent
      );
      
      console.log(`🎉 NLP processing completed:`, {
        processedItems: result.processedItems,
        totalChunks: result.totalChunks,
        totalVectors: result.totalVectors,
        processingTime: result.processingTime
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in processKnowledgeBase:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(req, res) {
    try {
      const { companyId, userId } = req;
      const { agentId, sessionId } = req.params;
      
      const conversation = await Conversation.findOne({ 
        sessionId, 
        companyId,
        userId 
      });
      
      if (!conversation) {
        return res.json({ 
          success: true, 
          data: { 
            sessionId, 
            messages: [], 
            createdAt: new Date() 
          } 
        });
      }
      
      res.json({ 
        success: true, 
        data: conversation 
      });
    } catch (error) {
      console.error('❌ Error getting conversation:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get conversation' 
      });
    }
  }
}

export default new CompanyAgentController();
