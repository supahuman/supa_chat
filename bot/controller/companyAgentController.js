import Agent from '../models/Agent.js';
import Conversation from '../models/Conversation.js';
import { getGlobalModel } from '../config/globalModel.js';

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
      const { message, sessionId, agentId, personality, conversationHistory } = req.body;
      
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
      
      const systemPrompt = `You are an AI assistant with the following personality: ${agentPersonality}

Your role is to help customers with their questions and provide helpful, accurate responses. Be conversational and maintain your personality throughout the conversation.

Previous conversation context:
${conversationContext || 'No previous context'}

Respond to the customer's message in character with your personality. Remember the conversation history and build upon it naturally.`;

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
      
      const response = await llm.generateResponse(messages);
      
      // Add AI response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: response.content,
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
        response: response.content,
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
   * Get conversation history
   */
  async getConversation(req, res) {
    try {
      const { companyId, userId } = req;
      const { sessionId } = req.params;
      
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
