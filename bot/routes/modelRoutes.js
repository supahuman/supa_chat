import express from 'express';
import modelController from '../controller/modelController.js';

const router = express.Router();

/**
 * Model information routes
 */

// Get current model information
router.get('/info', modelController.getModelInfo);

export default router;
