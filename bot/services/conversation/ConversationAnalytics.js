import ConversationRepository from './ConversationRepository.js';
import Conversation from '../../models/Conversation.js';

/**
 * Service for conversation analytics and statistics
 * Handles reporting and metrics
 */
class ConversationAnalytics {
  constructor() {
    this.repository = new ConversationRepository();
  }

  /**
   * Get conversation statistics for a company
   */
  async getCompanyStats(companyId) {
    try {
      const [
        totalConversations,
        activeConversations,
        escalatedConversations,
        avgMessages
      ] = await Promise.all([
        this.repository.count({ companyId }),
        this.repository.count({ companyId, status: 'active' }),
        this.repository.count({ companyId, status: 'escalated' }),
        this.getAverageMessages(companyId)
      ]);

      return {
        totalConversations,
        activeConversations,
        escalatedConversations,
        averageMessagesPerConversation: avgMessages
      };
    } catch (error) {
      console.error('❌ Error getting company stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Get global conversation statistics
   */
  async getGlobalStats() {
    try {
      const [
        totalConversations,
        activeConversations,
        escalatedConversations,
        avgMessages
      ] = await Promise.all([
        this.repository.count(),
        this.repository.count({ status: 'active' }),
        this.repository.count({ status: 'escalated' }),
        this.getAverageMessages()
      ]);

      return {
        totalConversations,
        activeConversations,
        escalatedConversations,
        averageMessagesPerConversation: avgMessages
      };
    } catch (error) {
      console.error('❌ Error getting global stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Get average messages per conversation
   */
  async getAverageMessages(companyId = null) {
    try {
      const filter = companyId ? { companyId } : {};
      
      const result = await Conversation.aggregate([
        { $match: filter },
        { $group: { _id: null, avgMessages: { $avg: '$metrics.messageCount' } } }
      ]);

      return result[0]?.avgMessages || 0;
    } catch (error) {
      console.error('❌ Error getting average messages:', error);
      return 0;
    }
  }

  /**
   * Get conversation trends over time
   */
  async getTrends(companyId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Conversation.aggregate([
        {
          $match: {
            companyId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            avgMessages: { $avg: '$metrics.messageCount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      return trends;
    } catch (error) {
      console.error('❌ Error getting conversation trends:', error);
      return [];
    }
  }

  /**
   * Get default stats when errors occur
   */
  getDefaultStats() {
    return {
      totalConversations: 0,
      activeConversations: 0,
      escalatedConversations: 0,
      averageMessagesPerConversation: 0
    };
  }
}

export default ConversationAnalytics;
