import express from 'express';
import { authenticateApiKey } from '../../middleware/auth.js';
import AgentCrawlerController from '../../controller/agent/agentCrawlerController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Crawl URLs for a specific agent
router.post('/:agentId/crawl', AgentCrawlerController.crawlAgentUrls);

// Get crawling status for an agent
router.get('/:agentId/crawl/status', AgentCrawlerController.getCrawlStatus);

// Clear agent's crawled knowledge base
router.delete('/:agentId/crawl', AgentCrawlerController.clearAgentKnowledgeBase);

// Test crawl a single URL
router.post('/:agentId/crawl/test', AgentCrawlerController.testCrawlUrl);

export default router;
