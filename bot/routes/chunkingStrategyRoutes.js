import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import {
  getStrategyStatus,
  switchStrategy,
  cleanDatabase,
  reloadKnowledgeBase,
  validateDatabase,
  getChunkingConfig,
} from '../controller/chunkingStrategyController.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(isAdmin);

// Strategy management endpoints
router.get('/status', getStrategyStatus);
router.post('/switch', switchStrategy);
router.post('/clean', cleanDatabase);
router.post('/reload', reloadKnowledgeBase);
router.get('/validate', validateDatabase);
router.get('/config', getChunkingConfig);

export default router;
