import ConversationRepository from './ConversationRepository.js';

/**
 * Service for generating conversation summaries
 * Handles summary creation and key point extraction
 */
class ConversationSummary {
  constructor() {
    this.repository = new ConversationRepository();
  }

  /**
   * Generate conversation summary for agents
   */
  async generateSummary(sessionId, escalationReason = null) {
    try {
      const conversation = await this.repository.findBySessionId(sessionId);
      if (!conversation) {
        return null;
      }

      // Create summary
      const summary = this.createConversationSummary(conversation.messages, escalationReason);
      const keyPoints = this.extractKeyPoints(conversation.messages);
      const duration = this.calculateDuration(conversation);

      // Update conversation with summary
      await this.repository.update(sessionId, {
        summary,
        status: 'escalated',
        'metrics.duration': duration
      });

      return {
        sessionId,
        userId: conversation.userId,
        companyId: conversation.companyId,
        agentId: conversation.agentId,
        summary,
        keyPoints,
        escalationReason,
        messageCount: conversation.messages.length,
        duration,
        createdAt: conversation.createdAt,
        escalatedAt: new Date().toISOString(),
        status: 'escalated'
      };
    } catch (error) {
      console.error('❌ Error generating conversation summary:', error);
      return null;
    }
  }

  /**
   * Create conversation summary text
   */
  createConversationSummary(messages, escalationReason) {
    if (messages.length === 0) return 'No conversation history available.';

    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    let summary = `Customer had ${messages.length} message exchange${messages.length > 1 ? 's' : ''}. `;
    
    if (userMessages.length > 0) {
      const firstUserMessage = userMessages[0].content;
      const lastUserMessage = userMessages[userMessages.length - 1].content;
      
      summary += `Initial request: "${firstUserMessage.substring(0, 100)}${firstUserMessage.length > 100 ? '...' : ''}". `;
      
      if (userMessages.length > 1) {
        summary += `Latest message: "${lastUserMessage.substring(0, 100)}${lastUserMessage.length > 100 ? '...' : ''}". `;
      }
    }

    if (escalationReason) {
      summary += `Escalation reason: ${escalationReason}. `;
    }

    summary += `Customer needs human assistance to resolve their issue.`;

    return summary;
  }

  /**
   * Extract key points from conversation
   */
  extractKeyPoints(messages) {
    const keyPoints = [];
    const userMessages = messages.filter(m => m.role === 'user');

    // Extract common issues
    const issueKeywords = ['problem', 'issue', 'error', 'can\'t', 'unable', 'help', 'fix', 'broken'];
    const urgencyKeywords = ['urgent', 'asap', 'immediately', 'frustrated', 'angry'];

    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Check for issues
      issueKeywords.forEach(keyword => {
        if (content.includes(keyword) && !keyPoints.some(kp => kp.includes(keyword))) {
          keyPoints.push(`Customer mentioned: ${keyword}`);
        }
      });

      // Check for urgency
      urgencyKeywords.forEach(keyword => {
        if (content.includes(keyword) && !keyPoints.some(kp => kp.includes('urgent'))) {
          keyPoints.push('Customer appears urgent/frustrated');
        }
      });
    });

    // If no specific issues found, add general points
    if (keyPoints.length === 0) {
      keyPoints.push('General inquiry or support request');
    }

    return keyPoints.slice(0, 5); // Max 5 key points
  }

  /**
   * Calculate conversation duration
   */
  calculateDuration(conversation) {
    if (conversation.messages.length < 2) return 0;
    
    const firstMessage = conversation.messages[0];
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    
    const startTime = new Date(firstMessage.timestamp);
    const endTime = new Date(lastMessage.timestamp);
    
    return Math.round((endTime - startTime) / 1000); // Duration in seconds
  }

  /**
   * Get conversation summary for agents
   */
  async getConversationSummary(sessionId) {
    try {
      const conversation = await this.repository.findBySessionId(sessionId);
      return conversation ? {
        sessionId: conversation.sessionId,
        summary: conversation.summary,
        status: conversation.status,
        escalatedAt: conversation.updatedAt
      } : null;
    } catch (error) {
      console.error('❌ Error getting conversation summary:', error);
      return null;
    }
  }
}

export default ConversationSummary;
