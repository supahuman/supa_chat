import express from 'express';
import agentChatController from '../../controller/agent/agentChatController.js';
import { authenticateCompany } from '../../middleware/auth.js';

const router = express.Router();

// Chat with a specific agent
router.post('/agents/:agentId/chat', authenticateCompany, agentChatController.chatWithAgent);

// Get conversation history
router.get('/agents/:agentId/conversations/:sessionId', authenticateCompany, agentChatController.getConversation);

export default router;
