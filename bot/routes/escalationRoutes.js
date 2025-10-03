import express from 'express';
import EscalationController from '../controller/escalationController.js';

const router = express.Router();
const escalationController = new EscalationController();

// Agent management routes
router.post('/agent', escalationController.createAgent);
router.get('/agent/client/:clientId', escalationController.getAgents);
router.put('/agent/:agentId/status', escalationController.updateAgentStatus);
router.get('/agent/:agentId/stats', escalationController.getAgentStats);

// Escalation management routes
router.post('/escalation', escalationController.createEscalation);
router.get('/escalation/client/:clientId', escalationController.getEscalations);
router.put('/escalation/:escalationId/assign', escalationController.assignEscalation);
router.put('/escalation/:escalationId/status', escalationController.updateEscalationStatus);
router.post('/escalation/:escalationId/message', escalationController.addMessageToEscalation);

// Escalation checking route
router.post('/escalation/check', escalationController.checkEscalation);

export default router;
