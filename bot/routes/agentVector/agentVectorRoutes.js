import express from 'express';
import agentVectorController from '../../controller/agentVector/agentVectorController.js';
import { authenticateApiKey, authenticateSession } from '../../middleware/auth.js';

const router = express.Router();

/**
 * AgentVector Routes - RESTful API endpoints for vector embedding management
 * Modular routes under 150 lines
 */

// Create new vector embedding
router.post('/', authenticateApiKey, agentVectorController.createVector.bind(agentVectorController));

// Get vectors for specific agent
router.get('/agent/:agentId', authenticateApiKey, agentVectorController.getVectors.bind(agentVectorController));

// Get vector statistics for agent
router.get('/agent/:agentId/stats', authenticateApiKey, agentVectorController.getVectorStats.bind(agentVectorController));

// Search vectors by similarity
router.post('/agent/:agentId/search', authenticateApiKey, agentVectorController.searchVectors.bind(agentVectorController));

// Delete specific vector
router.delete('/:vectorId', authenticateApiKey, agentVectorController.deleteVector.bind(agentVectorController));

// Delete all vectors for agent
router.delete('/agent/:agentId', authenticateApiKey, agentVectorController.deleteAgentVectors.bind(agentVectorController));

export default router;
