import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  processChatMessage,
  getUserConversations,
  getConversation,
  deleteConversation,
} from '../controller/chatController.js';

const router = express.Router();

// Chat endpoint
router.post('/chat', protect, processChatMessage);

// Get conversation history
router.get('/conversations', protect, getUserConversations);

// Get specific conversation
router.get('/conversations/:sessionId', protect, getConversation);

// Delete conversation
router.delete('/conversations/:sessionId', protect, deleteConversation);

export default router;
