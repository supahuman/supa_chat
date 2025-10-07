import express from 'express';
import clientManagementController from '../../controller/client/clientManagementController.js';

const router = express.Router();

/**
 * Client Management Routes
 * Handles client creation, updates, and management
 */

// List all clients
router.get('/', clientManagementController.listClients);

// Create new client
router.post('/', clientManagementController.createClient);

// Get specific client
router.get('/:clientId', clientManagementController.getClient);

// Update client configuration
router.put('/:clientId', clientManagementController.updateClient);

// Delete client
router.delete('/:clientId', clientManagementController.deleteClient);

// Test client database connection
router.post('/:clientId/test-database', clientManagementController.testDatabaseConnection);

// Test client LLM connection
router.post('/:clientId/test-llm', clientManagementController.testLLMConnection);

export default router;
