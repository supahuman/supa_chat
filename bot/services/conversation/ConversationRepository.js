import Conversation from '../../models/Conversation.js';

/**
 * Repository for basic conversation CRUD operations
 * Handles data persistence and retrieval
 */
class ConversationRepository {
  /**
   * Create a new conversation
   */
  async create(conversationData) {
    try {
      const conversation = new Conversation(conversationData);
      await conversation.save();
      return conversation;
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Find conversation by session ID
   */
  async findBySessionId(sessionId) {
    try {
      return await Conversation.findOne({ sessionId });
    } catch (error) {
      console.error('❌ Error finding conversation by session ID:', error);
      return null;
    }
  }

  /**
   * Update conversation
   */
  async update(sessionId, updateData) {
    try {
      return await Conversation.findOneAndUpdate(
        { sessionId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('❌ Error updating conversation:', error);
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async delete(sessionId) {
    try {
      return await Conversation.deleteOne({ sessionId });
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Find conversations by company
   */
  async findByCompany(companyId, limit = 50) {
    try {
      return await Conversation.find({ companyId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('❌ Error finding conversations by company:', error);
      return [];
    }
  }

  /**
   * Find conversations by agent
   */
  async findByAgent(agentId, companyId, limit = 50) {
    try {
      return await Conversation.find({ agentId, companyId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('❌ Error finding conversations by agent:', error);
      return [];
    }
  }

  /**
   * Find escalated conversations
   */
  async findEscalated(companyId) {
    try {
      return await Conversation.find({ 
        companyId, 
        status: 'escalated' 
      }).sort({ updatedAt: -1 });
    } catch (error) {
      console.error('❌ Error finding escalated conversations:', error);
      return [];
    }
  }

  /**
   * Count conversations with filter
   */
  async count(filter = {}) {
    try {
      return await Conversation.countDocuments(filter);
    } catch (error) {
      console.error('❌ Error counting conversations:', error);
      return 0;
    }
  }
}

export default ConversationRepository;
