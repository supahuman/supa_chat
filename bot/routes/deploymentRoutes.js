import express from 'express';
import { authenticateApiKey } from '../middleware/auth.js';
import DeploymentController from '../controller/deploymentController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Get deployment configuration for an agent
router.get('/:agentId/deploy', DeploymentController.getDeploymentConfig);

// Generate embed code for an agent
router.post('/:agentId/deploy/embed-code', DeploymentController.generateEmbedCode);

// Test deployment configuration
router.post('/:agentId/deploy/test', DeploymentController.testDeployment);

// Get deployment analytics for an agent
router.get('/:agentId/deploy/analytics', DeploymentController.getDeploymentAnalytics);

export default router;
