import express from 'express';
import toolController from '../../controller/tool/toolController.js';
import { authenticateCompany } from '../../middleware/auth.js';

const router = express.Router();

// Apply company authentication to all routes
router.use(authenticateCompany);

/**
 * @route   GET /api/company/agents/:agentId/tools
 * @desc    Get agent tools configuration
 * @access  Company
 */
router.get('/agents/:agentId/tools', toolController.getAgentTools);

/**
 * @route   PUT /api/company/agents/:agentId/tools
 * @desc    Update agent tools configuration
 * @access  Company
 */
router.put('/agents/:agentId/tools', toolController.updateAgentTools);

/**
 * @route   POST /api/company/agents/:agentId/tools/execute
 * @desc    Execute a tool
 * @access  Company
 */
router.post('/agents/:agentId/tools/execute', toolController.executeTool);

/**
 * @route   POST /api/company/agents/:agentId/tools/test
 * @desc    Test tool configuration
 * @access  Company
 */
router.post('/agents/:agentId/tools/test', toolController.testTool);

/**
 * @route   DELETE /api/company/agents/:agentId
 * @desc    Delete an agent (Admin only)
 * @access  Admin
 */
router.delete('/agents/:agentId', toolController.deleteAgent);

/**
 * @route   GET /api/tools/available
 * @desc    Get all available tools
 * @access  Public
 */
router.get('/tools/available', toolController.getAvailableTools);

export default router;
