import express from 'express';
import {
  processClientDocuments,
  getSupportedFileTypes,
  getChunkingInfo,
  updateChunkingConfig,
  testLangChainProcessing,
  getLangChainStats,
  toggleLangChainEnabled
} from '../controller/langchainKnowledgeBaseController.js';

const router = express.Router();

/**
 * Process client documents with LangChain
 * POST /api/bot/knowledge-base/langchain/process
 */
router.post('/process', processClientDocuments);

/**
 * Get supported file types for LangChain processing
 * GET /api/bot/knowledge-base/langchain/supported-types
 */
router.get('/supported-types', getSupportedFileTypes);

/**
 * Get LangChain chunking configuration
 * GET /api/bot/knowledge-base/langchain/config
 */
router.get('/config', getChunkingInfo);

/**
 * Update LangChain chunking configuration
 * PUT /api/bot/knowledge-base/langchain/config
 */
router.put('/config', updateChunkingConfig);

/**
 * Test LangChain document processing
 * POST /api/bot/knowledge-base/langchain/test
 */
router.post('/test', testLangChainProcessing);

/**
 * Get LangChain processing statistics
 * GET /api/bot/knowledge-base/langchain/stats
 */
router.get('/stats', getLangChainStats);

/**
 * Toggle LangChain processing on/off
 * POST /api/bot/knowledge-base/langchain/toggle
 */
router.post('/toggle', toggleLangChainEnabled);

export default router;
