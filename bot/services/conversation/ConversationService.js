import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service for managing conversation history
 * Supports both file-based and database persistence
 */
class ConversationService {
  constructor(options = {}) {
    this.conversationsFile = path.join(__dirname, '../../data/conversations.json');
    this.conversations = new Map(); // sessionId -> conversation data
    this.maxBotMessages = options.maxBotMessages || 4; // Keep last 4 messages for bot context
    this.summariesFile = path.join(__dirname, '../../data/conversation-summaries.json');
    this.summaries = new Map(); // sessionId -> summary data
    
    this.loadConversations();
    this.loadSummaries();
  }

  /**
   * Load conversations from file
   */
  loadConversations() {
    try {
      if (fsSync.existsSync(this.conversationsFile)) {
        const data = fsSync.readFileSync(this.conversationsFile, 'utf8');
        const conversationsArray = JSON.parse(data);
        this.conversations = new Map(conversationsArray.map(conv => [conv.sessionId, conv]));
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      this.conversations = new Map();
    }
  }

  /**
   * Load summaries from file
   */
  loadSummaries() {
    try {
      if (fsSync.existsSync(this.summariesFile)) {
        const data = fsSync.readFileSync(this.summariesFile, 'utf8');
        const summariesArray = JSON.parse(data);
        this.summaries = new Map(summariesArray.map(summary => [summary.sessionId, summary]));
      }
    } catch (error) {
      console.error('❌ Error loading summaries:', error);
      this.summaries = new Map();
    }
  }

  /**
   * Save conversations to file
   */
  saveConversations() {
    try {
      const conversationsArray = Array.from(this.conversations.values());
      fsSync.writeFileSync(this.conversationsFile, JSON.stringify(conversationsArray, null, 2));
    } catch (error) {
      console.error('❌ Error saving conversations:', error);
    }
  }

  /**
   * Save summaries to file
   */
  saveSummaries() {
    try {
      const summariesArray = Array.from(this.summaries.values());
      fsSync.writeFileSync(this.summariesFile, JSON.stringify(summariesArray, null, 2));
    } catch (error) {
      console.error('❌ Error saving summaries:', error);
    }
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId, limit = 10) {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      return [];
    }

    // Return last N messages
    return conversation.messages.slice(-limit);
  }

  /**
   * Add message to conversation (keeps only last 4 messages for bot context)
   */
  addMessage(sessionId, message) {
    let conversation = this.conversations.get(sessionId);
    
    if (!conversation) {
      conversation = {
        sessionId,
        clientId: message.clientId || 'unknown',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Add new message
    conversation.messages.push({
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString()
    });

    // Keep only last 4 messages for bot context
    if (conversation.messages.length > this.maxBotMessages) {
      conversation.messages = conversation.messages.slice(-this.maxBotMessages);
    }

    conversation.updatedAt = new Date().toISOString();
    this.conversations.set(sessionId, conversation);
    this.saveConversations();

    return conversation;
  }

  /**
   * Get conversation context for RAG
   */
  getConversationContext(sessionId, limit = 5) {
    const messages = this.getConversationHistory(sessionId, limit);
    
    // Format messages for RAG service
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Clear conversation history
   */
  clearConversation(sessionId) {
    this.conversations.delete(sessionId);
    this.saveConversations();
  }

  /**
   * Get all conversations for a client
   */
  getClientConversations(clientId) {
    return Array.from(this.conversations.values())
      .filter(conv => conv.clientId === clientId);
  }

  /**
   * Generate conversation summary for agents
   */
  generateSummary(sessionId, escalationReason = null) {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      return null;
    }

    // Create summary object
    const summary = {
      sessionId,
      clientId: conversation.clientId,
      summary: this.createConversationSummary(conversation.messages, escalationReason),
      keyPoints: this.extractKeyPoints(conversation.messages),
      escalationReason: escalationReason,
      messageCount: conversation.messages.length,
      duration: this.calculateDuration(conversation),
      createdAt: conversation.createdAt,
      escalatedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Save summary
    this.summaries.set(sessionId, summary);
    this.saveSummaries();

    return summary;
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
  getConversationSummary(sessionId) {
    return this.summaries.get(sessionId);
  }

  /**
   * Get all summaries for a client
   */
  getClientSummaries(clientId) {
    return Array.from(this.summaries.values())
      .filter(summary => summary.clientId === clientId);
  }

  /**
   * Update summary status
   */
  updateSummaryStatus(sessionId, status) {
    const summary = this.summaries.get(sessionId);
    if (summary) {
      summary.status = status;
      summary.updatedAt = new Date().toISOString();
      this.saveSummaries();
    }
    return summary;
  }

  /**
   * Get conversation statistics
   */
  getConversationStats() {
    const conversations = Array.from(this.conversations.values());
    const summaries = Array.from(this.summaries.values());
    
    return {
      totalConversations: conversations.length,
      totalSummaries: summaries.length,
      activeConversations: conversations.filter(conv => {
        const lastMessage = conv.messages[conv.messages.length - 1];
        if (!lastMessage) return false;
        
        const lastMessageTime = new Date(lastMessage.timestamp);
        const now = new Date();
        const hoursSinceLastMessage = (now - lastMessageTime) / (1000 * 60 * 60);
        
        return hoursSinceLastMessage < 24; // Active if last message within 24 hours
      }).length,
      averageMessagesPerConversation: conversations.reduce((sum, conv) => 
        sum + conv.messages.length, 0) / conversations.length || 0,
      escalatedConversations: summaries.filter(s => s.status !== 'resolved').length
    };
  }
}

export default ConversationService;
