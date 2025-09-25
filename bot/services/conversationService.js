import Conversation from '../models/Conversation.js';

class ConversationService {
  async createConversation(userId, sessionId) {
    try {
      const conversation = new Conversation({
        userId,
        sessionId,
        messages: [],
      });

      await conversation.save();
      return {
        success: true,
        conversation,
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getConversation(sessionId) {
    try {
      const conversation = await Conversation.findOne({ sessionId });
      return {
        success: true,
        conversation,
      };
    } catch (error) {
      console.error('Error getting conversation:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async addMessage(sessionId, message) {
    try {
      const conversation = await Conversation.findOne({ sessionId });

      if (!conversation) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      conversation.messages.push(message);
      conversation.updatedAt = new Date();
      await conversation.save();

      return {
        success: true,
        conversation,
      };
    } catch (error) {
      console.error('Error adding message:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getConversationHistory(sessionId, limit = 10) {
    try {
      const conversation = await Conversation.findOne({ sessionId });

      if (!conversation) {
        return {
          success: true,
          messages: [],
        };
      }

      // Get last N messages
      const messages = conversation.messages.slice(-limit);

      return {
        success: true,
        messages,
        totalMessages: conversation.messages.length,
      };
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return {
        success: false,
        error: error.message,
        messages: [],
      };
    }
  }

  async closeConversation(sessionId) {
    try {
      const conversation = await Conversation.findOne({ sessionId });

      if (!conversation) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      conversation.status = 'closed';
      conversation.updatedAt = new Date();
      await conversation.save();

      return {
        success: true,
        conversation,
      };
    } catch (error) {
      console.error('Error closing conversation:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getUserConversations(userId, limit = 20) {
    try {
      const conversations = await Conversation.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select('sessionId status createdAt updatedAt messages');

      return {
        success: true,
        conversations,
      };
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return {
        success: false,
        error: error.message,
        conversations: [],
      };
    }
  }

  async getConversationStats(userId) {
    try {
      const stats = await Conversation.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalConversations: { $sum: 1 },
            totalMessages: { $sum: { $size: '$messages' } },
            activeConversations: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
            },
          },
        },
      ]);

      return {
        success: true,
        stats: stats[0] || {
          totalConversations: 0,
          totalMessages: 0,
          activeConversations: 0,
        },
      };
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async cleanupOldConversations(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Conversation.deleteMany({
        updatedAt: { $lt: cutoffDate },
        status: 'closed',
      });

      return {
        success: true,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      console.error('Error cleaning up old conversations:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new ConversationService();
