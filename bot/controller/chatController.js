import conversationService from '../services/conversationService.js';
import ClientRAGService from '../services/client/ClientRAGService.js';
import ClientConfigService from '../services/client/ClientConfigService.js';
import AgentService from '../services/agent/AgentService.js';

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

    // Use the new client system with default 'supa-chat' client
    const clientConfigService = new ClientConfigService();
    const clientConfig = clientConfigService.getClientConfig('supa-chat');
    
    if (!clientConfig) {
      return res.status(500).json({
        success: false,
        error: 'Client configuration not found',
      });
    }

    const clientRAGService = new ClientRAGService();
    const ragResult = await clientRAGService.processQuery(
      'supa-chat',
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

// @desc    Process chat message for specific client
// @route   POST /api/client/:clientId/bot
// @access  Public (for client integration)
export const processClientChatMessage = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    console.log(`📝 Processing chat for client ${clientId}, session ${sessionId}`);

    // Use client-specific RAG service
    const clientConfigService = new ClientConfigService();
    const clientConfig = clientConfigService.getClientConfig(clientId);
    
    if (!clientConfig) {
      return res.status(404).json({
        success: false,
        error: 'Client configuration not found',
      });
    }

    // Check for escalation triggers
    const agentService = new AgentService();
    const escalationCheck = agentService.shouldEscalate(clientId, message, {
      sessionId,
      confidence: 0.8, // This would come from RAG result
      unresolvedCount: 0 // This would be tracked per session
    });

    // If escalation is needed, create escalation and return appropriate response
    if (escalationCheck.shouldEscalate) {
      console.log(`🚨 Escalation triggered: ${escalationCheck.reason}`);
      
      const escalation = agentService.createEscalation({
        clientId,
        sessionId,
        userId: sessionId, // Using sessionId as userId for now
        reason: escalationCheck.reason,
        priority: escalationCheck.priority,
        messages: [{ content: message, sender: 'customer', senderType: 'customer' }]
      });

      // Try to assign to available agent
      const availableAgents = agentService.getAvailableAgents(clientId);
      if (availableAgents.length > 0) {
        const assignedAgent = availableAgents[0];
        agentService.assignEscalation(escalation.id, assignedAgent.id);
        agentService.assignAgentToChat(assignedAgent.id, clientId, sessionId);
        
        return res.json({
          success: true,
          response: `I understand you need human assistance. I've connected you with ${assignedAgent.name}, who will be with you shortly.`,
          escalation: {
            id: escalation.id,
            status: 'assigned',
            agent: {
              name: assignedAgent.name,
              id: assignedAgent.id
            }
          },
          clientId,
          sessionId
        });
      } else {
        return res.json({
          success: true,
          response: `I understand you need human assistance. All our agents are currently busy, but I've added you to the queue. Someone will be with you as soon as possible.`,
          escalation: {
            id: escalation.id,
            status: 'pending',
            estimatedWaitTime: '5-10 minutes'
          },
          clientId,
          sessionId
        });
      }
    }

    // Process with RAG if no escalation needed
    const clientRAGService = new ClientRAGService();
    const ragResult = await clientRAGService.processQuery(
      clientId,
      message,
      [] // No conversation history for now
    );

    if (!ragResult.success) {
      return res.status(500).json({
        success: false,
        error: ragResult.error
      });
    }

    res.json({
      success: true,
      response: ragResult.response,
      sources: ragResult.sources,
      confidence: ragResult.confidence,
      model: ragResult.model,
      usage: ragResult.usage,
      clientId,
      sessionId
    });

  } catch (error) {
    console.error('❌ Client chat processing error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
