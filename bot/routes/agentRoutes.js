import express from 'express';
import agentController from '../controller/agentController.js';

const router = express.Router();

/**
 * Agent management routes
 */

// Create a new agent
router.post('/', agentController.createAgent.bind(agentController));

// Get all agents
router.get('/', agentController.getAgents.bind(agentController));

// Get a specific agent
router.get('/:agentId', agentController.getAgent.bind(agentController));

// Update an agent
router.put('/:agentId', agentController.updateAgent.bind(agentController));

// Delete an agent
router.delete('/:agentId', agentController.deleteAgent.bind(agentController));

// Chat with an agent
router.post('/chat', agentController.chatWithAgent.bind(agentController));

// Get conversation history
router.get('/conversation/:sessionId', agentController.getConversation.bind(agentController));

export default router;
