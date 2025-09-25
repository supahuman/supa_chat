import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import {
  processClientDocuments,
  getSupportedFileTypes,
  getLangChainConfig,
  updateLangChainConfig,
  testLangChainProcessing,
  getLangChainStats,
  toggleLangChain,
} from '../controller/langchainKnowledgeBaseController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Process client documents with LangChain
// @route   POST /api/bot/knowledge-base/langchain/process
// @access  Private
router.post('/process', processClientDocuments);

// @desc    Get supported file types for LangChain processing
// @route   GET /api/bot/knowledge-base/langchain/supported-types
// @access  Private
router.get('/supported-types', getSupportedFileTypes);

// @desc    Get LangChain chunking configuration
// @route   GET /api/bot/knowledge-base/langchain/config
// @access  Private
router.get('/config', getLangChainConfig);

// @desc    Update LangChain chunking configuration
// @route   PUT /api/bot/knowledge-base/langchain/config
// @access  Private/Admin
router.put('/config', isAdmin, updateLangChainConfig);

// @desc    Test LangChain document processing
// @route   POST /api/bot/knowledge-base/langchain/test
// @access  Private/Admin
router.post('/test', isAdmin, testLangChainProcessing);

// @desc    Get LangChain processing statistics
// @route   GET /api/bot/knowledge-base/langchain/stats
// @access  Private
router.get('/stats', getLangChainStats);

// @desc    Enable/disable LangChain chunking
// @route   POST /api/bot/knowledge-base/langchain/toggle
// @access  Private/Admin
router.post('/toggle', isAdmin, toggleLangChain);

export default router;
