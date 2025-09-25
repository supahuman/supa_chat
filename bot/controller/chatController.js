import ragService from '../services/ragService.js';
import conversationService from '../services/conversationService.js';

// @desc    Process chat message
// @route   POST /api/bot/chat
// @access  Private
export const processChatMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Get or create conversation
    let conversation = null;
    if (sessionId) {
      conversation = await conversationService.getConversation(
        sessionId,
        userId
      );
    }

    if (!conversation) {
      // Generate new session ID
      const newSessionId = conversationService.generateSessionId();
      const createResult = await conversationService.createConversation(
        userId,
        newSessionId
      );

      if (!createResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create conversation',
        });
      }

      conversation = createResult.conversation;
    }

    // Add user message to conversation
    await conversationService.addMessage(conversation.sessionId, {
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Process with RAG
    const historyResult = await conversationService.getConversationHistory(
      conversation.sessionId
    );

    // Ensure conversationHistory is always an array
    let conversationHistory = [];
    if (historyResult.success && Array.isArray(historyResult.messages)) {
      conversationHistory = historyResult.messages;
    }

    console.log(
      `📝 Processing with ${conversationHistory.length} previous messages`
    );

    const ragResult = await ragService.processQuery(
      message,
      conversationHistory
    );

    if (ragResult.success) {
      // Add bot response to conversation
      await conversationService.addMessage(conversation.sessionId, {
        role: 'assistant',
        content: ragResult.response,
        timestamp: new Date(),
      });

      res.json({
        success: true,
        response: ragResult.response,
        sessionId: conversation.sessionId,
        confidence: ragResult.confidence,
        model: ragResult.model,
        usage: ragResult.usage,
      });
    } else {
      res.status(500).json({
        success: false,
        error: ragResult.error || 'Failed to process query',
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// @desc    Get user conversations
// @route   GET /api/bot/conversations
// @access  Private
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await conversationService.getUserConversations(
      userId
    );

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// @desc    Get specific conversation
// @route   GET /api/bot/conversations/:sessionId
// @access  Private
export const getConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const conversation = await conversationService.getConversation(
      sessionId,
      userId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    const messages = await conversationService.getConversationHistory(
      sessionId
    );

    res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// @desc    Delete conversation
// @route   DELETE /api/bot/conversations/:sessionId
// @access  Private
export const deleteConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await conversationService.deleteConversation(
      sessionId,
      userId
    );

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
