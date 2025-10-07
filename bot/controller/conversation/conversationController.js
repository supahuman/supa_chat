import Conversation from '../../models/conversation.js';
import BaseController from '../shared/baseController.js';

/**
 * ConversationController - Handles conversation management operations
 * Modular controller under 150 lines
 */
class ConversationController extends BaseController {
  constructor() {
    super();
    this.logAction('ConversationController initialized');
  }

  /**
   * Create a new conversation
   */
  async createConversation(req, res) {
    try {
      const { sessionId, userId, agentId, initialMessage } = req.body;
      const { companyId } = this.getCompanyContext(req);

      const validation = this.validateRequiredFields(req.body, ['sessionId', 'userId', 'agentId']);
      if (!validation.isValid) {
        return this.sendValidationError(res, 'Missing required fields', validation.missingFields);
      }

      const existingConversation = await Conversation.findOne({ sessionId });
      if (existingConversation) {
        return this.sendError(res, 'Conversation with this session ID already exists', 409);
      }

      const conversation = new Conversation({
        sessionId,
        userId,
        companyId,
        agentId,
        messages: initialMessage ? [{
          role: 'user',
          content: initialMessage,
          timestamp: new Date()
        }] : [],
        status: 'active'
      });

      await conversation.save();
      this.logAction('Conversation created', { sessionId, userId, agentId });
      
      return this.sendSuccess(res, conversation, 'Conversation created successfully', 201);
    } catch (error) {
      this.logError('createConversation', error, { body: req.body });
      return this.sendError(res, 'Failed to create conversation', 500);
    }
  }

  /**
   * Get conversation by session ID
   */
  async getConversation(req, res) {
    try {
      const { sessionId } = req.params;
      const { companyId } = this.getCompanyContext(req);

      const conversation = await Conversation.findOne({ sessionId, companyId });
      if (!conversation) {
        return this.sendNotFound(res, 'Conversation');
      }

      return this.sendSuccess(res, conversation);
    } catch (error) {
      this.logError('getConversation', error, { sessionId: req.params.sessionId });
      return this.sendError(res, 'Failed to get conversation', 500);
    }
  }

  /**
   * Get conversations for user or agent
   */
  async getConversations(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      const { userId, agentId, status, limit = 50 } = req.query;

      const filter = { companyId };
      if (userId) filter.userId = userId;
      if (agentId) filter.agentId = agentId;
      if (status) filter.status = status;

      const conversations = await Conversation.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      return this.sendSuccess(res, conversations);
    } catch (error) {
      this.logError('getConversations', error, { query: req.query });
      return this.sendError(res, 'Failed to get conversations', 500);
    }
  }

  /**
   * Add message to conversation
   */
  async addMessage(req, res) {
    try {
      const { sessionId } = req.params;
      const { role, content, metadata, embedding } = req.body;
      const { companyId } = this.getCompanyContext(req);

      const validation = this.validateRequiredFields(req.body, ['role', 'content']);
      if (!validation.isValid) {
        return this.sendValidationError(res, 'Missing required fields', validation.missingFields);
      }

      const conversation = await Conversation.findOne({ sessionId, companyId });
      if (!conversation) {
        return this.sendNotFound(res, 'Conversation');
      }

      const message = {
        role,
        content,
        timestamp: new Date(),
        metadata: metadata || {},
        embedding: embedding || []
      };

      conversation.messages.push(message);
      conversation.metrics.messageCount = conversation.messages.length;
      await conversation.save();

      this.logAction('Message added', { sessionId, role });
      return this.sendSuccess(res, conversation, 'Message added successfully');
    } catch (error) {
      this.logError('addMessage', error, { sessionId: req.params.sessionId });
      return this.sendError(res, 'Failed to add message', 500);
    }
  }

  /**
   * Update conversation status
   */
  async updateStatus(req, res) {
    try {
      const { sessionId } = req.params;
      const { status, summary, metrics } = req.body;
      const { companyId } = this.getCompanyContext(req);

      const updateData = {};
      if (status) updateData.status = status;
      if (summary) updateData.summary = summary;
      if (metrics) updateData.metrics = { ...updateData.metrics, ...metrics };

      const conversation = await Conversation.findOneAndUpdate(
        { sessionId, companyId },
        updateData,
        { new: true }
      );

      if (!conversation) {
        return this.sendNotFound(res, 'Conversation');
      }

      this.logAction('Conversation status updated', { sessionId, status });
      return this.sendSuccess(res, conversation, 'Status updated successfully');
    } catch (error) {
      this.logError('updateStatus', error, { sessionId: req.params.sessionId });
      return this.sendError(res, 'Failed to update status', 500);
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(req, res) {
    try {
      const { sessionId } = req.params;
      const { companyId } = this.getCompanyContext(req);

      const conversation = await Conversation.findOneAndDelete({ sessionId, companyId });
      if (!conversation) {
        return this.sendNotFound(res, 'Conversation');
      }

      this.logAction('Conversation deleted', { sessionId });
      return this.sendSuccess(res, null, 'Conversation deleted successfully');
    } catch (error) {
      this.logError('deleteConversation', error, { sessionId: req.params.sessionId });
      return this.sendError(res, 'Failed to delete conversation', 500);
    }
  }
}

export default new ConversationController();
