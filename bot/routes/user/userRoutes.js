import express from 'express';
import userController from '../../controller/user/userController.js';
import { authenticateApiKey, authenticateSession } from '../../middleware/auth.js';

const router = express.Router();

/**
 * User Routes - RESTful API endpoints for user management
 * Modular routes under 150 lines
 */

// Create user
router.post('/', userController.createUser.bind(userController));

// Get all users for company (with optional filtering)
router.get('/', authenticateApiKey, userController.getUsers.bind(userController));

// Get specific user by ID
router.get('/:userId', authenticateApiKey, userController.getUser.bind(userController));

// Update user
router.put('/:userId', authenticateApiKey, userController.updateUser.bind(userController));

// Delete user
router.delete('/:userId', authenticateApiKey, userController.deleteUser.bind(userController));

// Update user's last login timestamp
router.patch('/:userId/last-login', authenticateApiKey, userController.updateLastLogin.bind(userController));

export default router;
