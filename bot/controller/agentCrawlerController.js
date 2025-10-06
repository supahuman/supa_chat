import AgentCrawlerService from '../services/nlp/AgentCrawlerService.js';
import Agent from '../models/Agent.js';

class AgentCrawlerController {
  /**
   * Crawl URLs for a specific agent
   * POST /api/company/agents/:agentId/crawl
   */
  async crawlAgentUrls(req, res) {
    try {
      const { agentId } = req.params;
      const { urls } = req.body;
      const { companyId } = req;

      // Validate input
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'URLs array is required and must not be empty'
        });
      }

      // Validate URLs
      const validUrls = urls.filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });

      if (validUrls.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid URLs provided'
        });
      }

      // Check if agent exists and belongs to company
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      console.log(`🕷️ Starting crawl for agent ${agentId} with ${validUrls.length} URLs`);

      // Start crawling
      const result = await AgentCrawlerService.crawlForAgent(agentId, companyId, validUrls);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: `Successfully crawled ${result.crawledCount} pages`,
          data: {
            agentId,
            crawledCount: result.crawledCount,
            errorCount: result.errorCount,
            errors: result.errors,
            totalUrls: validUrls.length
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Crawling failed',
          error: result.error
        });
      }

    } catch (error) {
      console.error('❌ Error in crawlAgentUrls:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get crawling status for an agent
   * GET /api/company/agents/:agentId/crawl/status
   */
  async getCrawlStatus(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req;

      // Check if agent exists
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Get knowledge base stats
      const knowledgeBaseStats = {
        totalItems: agent.knowledgeBase?.length || 0,
        urlItems: agent.knowledgeBase?.filter(item => item.type === 'url').length || 0,
        textItems: agent.knowledgeBase?.filter(item => item.type === 'text').length || 0,
        documentItems: agent.knowledgeBase?.filter(item => item.type === 'document').length || 0
      };

      // Get crawler service stats
      const crawlerStats = AgentCrawlerService.getStats();

      res.status(200).json({
        success: true,
        data: {
          agentId,
          knowledgeBase: knowledgeBaseStats,
          crawler: crawlerStats,
          lastUpdated: agent.updatedAt
        }
      });

    } catch (error) {
      console.error('❌ Error in getCrawlStatus:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Clear agent's crawled knowledge base
   * DELETE /api/company/agents/:agentId/crawl
   */
  async clearAgentKnowledgeBase(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req;

      // Check if agent exists
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Clear only URL-based knowledge (keep text and document items)
      const filteredKnowledgeBase = agent.knowledgeBase?.filter(item => item.type !== 'url') || [];

      // Update agent
      await Agent.updateOne(
        { agentId, companyId },
        { 
          knowledgeBase: filteredKnowledgeBase,
          updatedAt: new Date()
        }
      );

      // Clear crawler cache
      AgentCrawlerService.clearCache();

      res.status(200).json({
        success: true,
        message: 'Agent knowledge base cleared',
        data: {
          agentId,
          remainingItems: filteredKnowledgeBase.length,
          clearedItems: (agent.knowledgeBase?.length || 0) - filteredKnowledgeBase.length
        }
      });

    } catch (error) {
      console.error('❌ Error in clearAgentKnowledgeBase:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Test crawl a single URL
   * POST /api/company/agents/:agentId/crawl/test
   */
  async testCrawlUrl(req, res) {
    try {
      const { agentId } = req.params;
      const { url } = req.body;
      const { companyId } = req;

      // Validate URL
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }

      try {
        new URL(url);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
      }

      // Check if agent exists
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      console.log(`🧪 Testing crawl for URL: ${url}`);

      // Test crawl the URL
      const result = await AgentCrawlerService.crawlPage(url);

      if (result) {
        res.status(200).json({
          success: true,
          message: 'URL crawled successfully',
          data: {
            url: result.url,
            title: result.title,
            category: result.category,
            wordCount: result.metadata.wordCount,
            preview: result.content.substring(0, 200) + '...'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to crawl URL - no content extracted'
        });
      }

    } catch (error) {
      console.error('❌ Error in testCrawlUrl:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

export default new AgentCrawlerController();
