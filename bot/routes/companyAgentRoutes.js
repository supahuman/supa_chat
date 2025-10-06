import express from 'express';
import companyAgentController from '../controller/companyAgentController.js';
import { authenticateApiKey, authenticateSession } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateApiKey);

// Agent CRUD operations
router.post('/', companyAgentController.createAgent.bind(companyAgentController));
router.get('/', companyAgentController.getAgents.bind(companyAgentController));
router.get('/:agentId', companyAgentController.getAgent.bind(companyAgentController));
router.put('/:agentId', companyAgentController.updateAgent.bind(companyAgentController));
router.delete('/:agentId', companyAgentController.deleteAgent.bind(companyAgentController));

// Knowledge base operations
router.post('/:agentId/knowledge', companyAgentController.addKnowledgeItem.bind(companyAgentController));

// Chat operations
router.post('/:agentId/chat', companyAgentController.chatWithAgent.bind(companyAgentController));
router.get('/:agentId/conversation/:sessionId', companyAgentController.getConversation.bind(companyAgentController));

export default router;
