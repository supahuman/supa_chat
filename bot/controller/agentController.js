import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getGlobalModel } from '../config/globalModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controller for agent management
 * Handles CRUD operations for AI agents
 */
class AgentController {
  constructor() {
    this.agentsFile = path.join(__dirname, '../data/agents.json');
    this.conversationsFile = path.join(__dirname, '../data/agent-conversations.json');
    this.agents = new Map();
    this.conversations = new Map(); // Store conversations by sessionId
    this.initialized = false;
    this.initPromise = this.loadAgents();
    this.loadConversations();
  }

  /**
   * Load agents from file
   */
  async loadAgents() {
    try {
      const data = await fs.readFile(this.agentsFile, 'utf8');
      const agentsData = JSON.parse(data);
      this.agents = new Map(Object.entries(agentsData));
      this.initialized = true;
      console.log(`✅ Loaded ${this.agents.size} agents`);
    } catch (error) {
      console.log('📝 No existing agents file, starting fresh');
      this.agents = new Map();
      this.initialized = true;
    }
  }

  /**
   * Load conversations from file
   */
  async loadConversations() {
    try {
      const data = await fs.readFile(this.conversationsFile, 'utf8');
      const conversationsData = JSON.parse(data);
      this.conversations = new Map(Object.entries(conversationsData));
      console.log(`✅ Loaded ${this.conversations.size} conversations`);
    } catch (error) {
      console.log('📝 No existing conversations file, starting fresh');
      this.conversations = new Map();
    }
  }

  /**
   * Save conversations to file
   */
  async saveConversations() {
    try {
      const conversationsData = Object.fromEntries(this.conversations);
      await fs.writeFile(this.conversationsFile, JSON.stringify(conversationsData, null, 2));
    } catch (error) {
      console.error('❌ Error saving conversations:', error);
    }
  }

  /**
   * Save agents to file
   */
  async saveAgents() {
    try {
      const agentsData = Object.fromEntries(this.agents);
      await fs.writeFile(this.agentsFile, JSON.stringify(agentsData, null, 2));
    } catch (error) {
      console.error('❌ Error saving agents:', error);
      throw error;
    }
  }

  /**
   * Create a new agent
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createAgent(req, res) {
    try {
      // Wait for initialization if needed
      if (!this.initialized) {
        await this.initPromise;
      }

      const { name, description, personality, knowledgeBase, trainingExamples } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required'
        });
      }

      const agentId = `agent-${Date.now()}`;
      const globalModel = getGlobalModel();

      const agent = {
        id: agentId,
        name,
        description: description || 'AI Agent created with Agent Builder',
        personality: personality || 'friendly and helpful',
        knowledgeBase: knowledgeBase || [],
        trainingExamples: trainingExamples || [],
        model: globalModel, // Use global model
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.agents.set(agentId, agent);
      await this.saveAgents();

      res.json({
        success: true,
        data: agent,
        message: 'Agent created successfully'
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
   * Get all agents
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAgents(req, res) {
    try {
      const agents = Array.from(this.agents.values());
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
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAgent(req, res) {
    try {
      const { agentId } = req.params;
      const agent = this.agents.get(agentId);

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
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateAgent(req, res) {
    try {
      const { agentId } = req.params;
      const updates = req.body;

      const agent = this.agents.get(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      const updatedAgent = {
        ...agent,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.agents.set(agentId, updatedAgent);
      await this.saveAgents();

      res.json({
        success: true,
        data: updatedAgent,
        message: 'Agent updated successfully'
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
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteAgent(req, res) {
    try {
      const { agentId } = req.params;

      if (!this.agents.has(agentId)) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      this.agents.delete(agentId);
      await this.saveAgents();

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
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async chatWithAgent(req, res) {
    try {
      console.log('🚀 Chat endpoint called with body:', req.body);
      
      const { message, sessionId, agentId, personality, conversationHistory } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      // Wait for initialization if needed
      if (!this.initialized) {
        await this.initPromise;
      }

      // Get agent if agentId provided
      let agent = null;
      if (agentId && this.agents.has(agentId)) {
        agent = this.agents.get(agentId);
      }

      // Use agent personality or provided personality
      const agentPersonality = agent?.personality || personality || 'friendly and helpful';

      console.log('🎭 Using personality:', agentPersonality);

      // Get or create conversation history
      let conversation = this.conversations.get(sessionId);
      if (!conversation) {
        conversation = {
          sessionId,
          agentId: agent?.id,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.conversations.set(sessionId, conversation);
      }

      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Keep only last 10 messages for context (to avoid token limits)
      if (conversation.messages.length > 10) {
        conversation.messages = conversation.messages.slice(-10);
      }

      conversation.updatedAt = new Date().toISOString();

      // Create system prompt with agent personality and conversation history
      const conversationContext = conversation.messages
        .slice(0, -1) // Exclude the current message
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `You are an AI assistant with the following personality: ${agentPersonality}

Your role is to help customers with their questions and provide helpful, accurate responses. Be conversational and maintain your personality throughout the conversation.

Previous conversation context:
${conversationContext || 'No previous context'}

Respond to the customer's message in character with your personality. Remember the conversation history and build upon it naturally.`;

      // Use the global model for response generation
      const globalModel = getGlobalModel();
      console.log('🤖 Using global model:', globalModel);
      
      const LLMFactory = (await import('../services/llm/LLMFactory.js')).default;
      console.log('🏭 LLMFactory imported successfully');
      
      const llm = LLMFactory.create(globalModel.provider, {
        apiKey: process.env[`${globalModel.provider.toUpperCase()}_API_KEY`],
        model: globalModel.model,
        temperature: globalModel.temperature,
        maxTokens: globalModel.maxTokens
      });
      console.log('🔧 LLM instance created');

      await llm.initialize();
      console.log('✅ LLM initialized');

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ];

      console.log('💬 Generating response for messages:', messages);
      const response = await llm.generateResponse(messages);
      console.log('🎯 Response generated:', response);

      // Add agent response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString()
      });

      // Save conversation
      await this.saveConversations();
      console.log('💾 Conversation saved for session:', sessionId);

      res.json({
        success: true,
        response: response.content,
        agentId: agent?.id,
        personality: agentPersonality,
        conversationId: sessionId
      });

    } catch (error) {
      console.error('❌ Error chatting with agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agent response'
      });
    }
  }

  /**
   * Get conversation history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getConversation(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const conversation = this.conversations.get(sessionId);
      console.log('🔍 Looking for conversation with sessionId:', sessionId);
      console.log('📚 Available conversations:', Array.from(this.conversations.keys()));
      
      if (!conversation) {
        console.log('❌ No conversation found for sessionId:', sessionId);
        return res.json({
          success: true,
          data: {
            sessionId,
            messages: [],
            createdAt: new Date().toISOString()
          }
        });
      }

      console.log('✅ Found conversation with', conversation.messages.length, 'messages');
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

export default new AgentController();
