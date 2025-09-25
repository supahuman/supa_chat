import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import {
  getKnowledgeBaseInfo,
  loadCompleteKnowledgeBase,
  updateKnowledgeBase,
  testKnowledgeBase,
  clearCrawledContent,
  searchKnowledgeBase,
  getCrawlStats,
} from '../controller/knowledgeBaseController.js';
import knowledgeBaseService from '../services/knowledgeBaseService.js';

const router = express.Router();

// Initialize knowledge base service
router.use(async (req, res, next) => {
  if (!knowledgeBaseService.initialized) {
    await knowledgeBaseService.initialize();
  }
  next();
});

// Get knowledge base information
router.get('/info', protect, isAdmin, getKnowledgeBaseInfo);

// Load complete knowledge base (static + crawled)
router.post('/load', protect, isAdmin, loadCompleteKnowledgeBase);

// Update knowledge base (re-crawl help center)
router.post('/update', protect, isAdmin, updateKnowledgeBase);

// Test knowledge base with sample queries
router.post('/test', protect, isAdmin, testKnowledgeBase);

// Clear crawled content only
router.delete('/crawled', protect, isAdmin, clearCrawledContent);

// Search knowledge base (for testing)
router.post('/search', protect, isAdmin, searchKnowledgeBase);

// Get crawling statistics
router.get('/crawl-stats', protect, isAdmin, getCrawlStats);

export default router;
