import ConversationRepository from "./ConversationRepository.js";
import ConversationAnalytics from "./ConversationAnalytics.js";
import ConversationSummary from "./ConversationSummary.js";

/**
 * Main conversation service - orchestrates other conversation services
 * Provides a clean API for conversation management
 */
class ConversationService {
  constructor(options = {}) {
    this.maxBotMessages = options.maxBotMessages || 10; // Keep last 10 messages for bot context
    this.repository = new ConversationRepository();
    this.analytics = new ConversationAnalytics();
    this.summary = new ConversationSummary();
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(sessionId, limit = 10) {
    try {
      const conversation = await this.repository.findBySessionId(sessionId);
      if (!conversation) {
        return [];
      }

      // Return last N messages
      return conversation.messages.slice(-limit);
    } catch (error) {
      console.error("❌ Error getting conversation history:", error);
      return [];
    }
  }

  /**
   * Get full conversation for a session
   */
  async getConversation(sessionId) {
    try {
      return await this.repository.findBySessionId(sessionId);
    } catch (error) {
      console.error("❌ Error getting conversation:", error);
      return null;
    }
  }

  /**
   * Add message to conversation (keeps only last 4 messages for bot context)
   */
  async addMessage(
    sessionId,
    message,
    userId = null,
    companyId = null,
    agentId = null
  ) {
    try {
      // Find or create conversation
      let conversation = await this.repository.findBySessionId(sessionId);

      if (!conversation) {
        conversation = await this.repository.create({
          sessionId,
          userId: userId || "unknown",
          companyId: companyId || "unknown",
          agentId: agentId || "unknown",
          messages: [],
          status: "active",
        });
      }

      // Add new message
      conversation.messages.push({
        role: message.role,
        content: message.content,
        timestamp: new Date(),
        metadata: message.metadata || {},
      });

      // Keep only last 10 messages for bot context
      if (conversation.messages.length > this.maxBotMessages) {
        conversation.messages = conversation.messages.slice(
          -this.maxBotMessages
        );
      }

      // Update metrics and save
      await this.repository.update(sessionId, {
        messages: conversation.messages,
        "metrics.messageCount": conversation.messages.length,
      });

      return conversation;
    } catch (error) {
      console.error("❌ Error adding message to conversation:", error);
      throw error;
    }
  }

  /**
   * Get conversation context for RAG
   */
  async getConversationContext(sessionId, limit = 5) {
    try {
      const messages = await this.getConversationHistory(sessionId, limit);

      // Format messages for RAG service
      return messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    } catch (error) {
      console.error("❌ Error getting conversation context:", error);
      return [];
    }
  }

  /**
   * Clear conversation history
   */
  async clearConversation(sessionId) {
    try {
      await this.repository.delete(sessionId);
    } catch (error) {
      console.error("❌ Error clearing conversation:", error);
    }
  }

  /**
   * Get all conversations for a company
   */
  async getCompanyConversations(companyId, limit = 50) {
    return await this.repository.findByCompany(companyId, limit);
  }

  /**
   * Get conversations for a specific agent
   */
  async getAgentConversations(agentId, companyId, limit = 50) {
    return await this.repository.findByAgent(agentId, companyId, limit);
  }

  /**
   * Generate conversation summary for agents
   */
  async generateSummary(sessionId, escalationReason = null) {
    return await this.summary.generateSummary(sessionId, escalationReason);
  }

  /**
   * Get conversation summary for agents
   */
  async getConversationSummary(sessionId) {
    return await this.summary.getConversationSummary(sessionId);
  }

  /**
   * Get all escalated conversations for a company
   */
  async getCompanyEscalatedConversations(companyId) {
    return await this.repository.findEscalated(companyId);
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(sessionId, status) {
    return await this.repository.update(sessionId, { status });
  }

  /**
   * Get conversation statistics for a company
   */
  async getConversationStats(companyId = null) {
    return companyId
      ? await this.analytics.getCompanyStats(companyId)
      : await this.analytics.getGlobalStats();
  }

  /**
   * Process client chat message - handles messages from embed widget
   */
  async processClientChatMessage(req, res) {
    try {
      const { clientId } = req.params;
      const { message, sessionId, conversationHistory } = req.body;
      const { companyApiKey, userId } = req.headers;

      // Validate required fields
      if (!message) {
        return res.status(400).json({
          success: false,
          error: "Message is required",
        });
      }

      // TODO: Add client authentication and validation
      // TODO: Process the message with the appropriate agent
      // TODO: Return the response

      // For now, return a simple response
      res.json({
        success: true,
        response: `Echo: ${message}`,
        sessionId: sessionId || `session_${Date.now()}`,
      });
    } catch (error) {
      console.error("❌ Error processing client chat message:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process message",
      });
    }
  }
}

// Export the function for use in routes
export const processClientChatMessage = async (req, res) => {
  const conversationService = new ConversationService();
  return await conversationService.processClientChatMessage(req, res);
};

export default ConversationService;
