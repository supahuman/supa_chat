import express from 'express';
import conversationController from '../../controller/conversation/conversationController.js';
import { authenticateApiKey, authenticateSession } from '../../middleware/auth.js';

const router = express.Router();

/**
 * Conversation Routes - RESTful API endpoints for conversation management
 * Modular routes under 150 lines
 */

// Create new conversation
router.post('/', authenticateApiKey, conversationController.createConversation.bind(conversationController));

// Get conversations with optional filtering
router.get('/', authenticateApiKey, conversationController.getConversations.bind(conversationController));

// Get specific conversation by session ID
router.get('/:sessionId', authenticateApiKey, conversationController.getConversation.bind(conversationController));

// Add message to conversation
router.post('/:sessionId/messages', authenticateApiKey, conversationController.addMessage.bind(conversationController));

// Update conversation status
router.patch('/:sessionId/status', authenticateApiKey, conversationController.updateStatus.bind(conversationController));

// Delete conversation
router.delete('/:sessionId', authenticateApiKey, conversationController.deleteConversation.bind(conversationController));

export default router;
