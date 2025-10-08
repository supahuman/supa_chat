import express from 'express';
import agentChatController from '../../controller/agent/agentChatController.js';
import { authenticateCompany, authenticateAgentApiKey } from '../../middleware/auth.js';

const router = express.Router();

// Chat with a specific agent (company authentication - for admin/management)
router.post('/agents/:agentId/chat', authenticateCompany, agentChatController.chatWithAgent);

// Get conversation history (company authentication - for admin/management)
router.get('/agents/:agentId/conversations/:sessionId', authenticateCompany, agentChatController.getConversation);

// Chat with agent using agent API key (for embed widget)
router.post('/chat', authenticateAgentApiKey, agentChatController.chatWithAgentByApiKey.bind(agentChatController));

// Get conversation history using agent API key (for embed widget)
router.get('/conversations/:sessionId', authenticateAgentApiKey, agentChatController.getConversationByApiKey.bind(agentChatController));

export default router;
