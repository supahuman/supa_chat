import ClientConfigService from '../services/client/ClientConfigService.js';
import AgentService from '../services/agent/AgentService.js';
import ConversationService from '../services/conversation/ConversationService.js';

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

    // Use new conversation service
    const conversationService = new ConversationService();
    
    // Add user message to conversation
    await conversationService.addMessage(sessionId || `session_${Date.now()}`, {
      role: 'user',
      content: message,
      clientId: 'supa-chat'
    }, null, null, null);

    // Get conversation history for context
    const conversationHistory = await conversationService.getConversationContext(sessionId || `session_${Date.now()}`, 5);

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

    // For now, return a simple response since we're transitioning to NLP pipeline
    // TODO: Integrate with NLP pipeline for semantic search
    const response = `I received your message: "${message}". How can I help you today?`;

        // Add bot response to conversation
        await conversationService.addMessage(sessionId || `session_${Date.now()}`, {
          role: 'assistant',
          content: response,
          clientId: 'supa-chat'
        }, null, null, null);

    res.json({
      success: true,
      response: response,
      sessionId: sessionId || `session_${Date.now()}`,
      confidence: 0.8,
      model: 'simple-response',
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    });
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

    // Check if this session is already escalated
    const agentService = new AgentService();
    const existingEscalations = agentService.getEscalationsByClient(clientId);
    const activeEscalation = existingEscalations.find(e => 
      e.sessionId === sessionId && 
      (e.status === 'assigned' || e.status === 'in_progress')
    );

    // If already escalated, don't process with AI
    if (activeEscalation) {
      return res.json({
        success: true,
        response: `You're already connected with a human agent. They will respond to your message shortly.`,
        escalation: {
          id: activeEscalation.id,
          status: activeEscalation.status,
          agent: {
            name: activeEscalation.assignedAgent ? 'Human Agent' : 'Queue',
            id: activeEscalation.assignedAgent
          }
        },
        clientId,
        sessionId
      });
    }

    // Check for escalation triggers
    const escalationCheck = agentService.shouldEscalate(clientId, message, {
      sessionId,
      confidence: 0.8,
      unresolvedCount: 0
    });

    // If escalation is needed, create escalation and return appropriate response
    if (escalationCheck.shouldEscalate) {
      console.log(`🚨 Escalation triggered: ${escalationCheck.reason}`);
      
      // Generate conversation summary for agents
      const conversationService = new ConversationService();
      const summary = await conversationService.generateSummary(sessionId, escalationCheck.reason);
      console.log('📋 Generated conversation summary:', summary?.summary);
      
      const escalation = agentService.createEscalation({
        clientId,
        sessionId,
        userId: sessionId,
        reason: escalationCheck.reason,
        priority: escalationCheck.priority,
        messages: [{ content: message, sender: 'customer', senderType: 'customer' }],
        summary: summary // Include summary in escalation
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

    // Add user message to conversation history
    const conversationService = new ConversationService();
    await conversationService.addMessage(sessionId, {
      role: 'user',
      content: message,
      clientId
    }, null, null, null);

    // Get conversation history for context
    const conversationHistory = await conversationService.getConversationContext(sessionId, 5);

    // For now, return a simple response since we're transitioning to NLP pipeline
    // TODO: Integrate with NLP pipeline for semantic search
    const response = `I received your message: "${message}". How can I help you today?`;

    // Add bot response to conversation history
    await conversationService.addMessage(sessionId, {
      role: 'assistant',
      content: response,
      clientId
    }, null, null, null);

    res.json({
      success: true,
      response: response,
      sources: [],
      confidence: 0.8,
      model: 'simple-response',
      usage: { prompt_tokens: 0, completion_tokens: 0 },
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
