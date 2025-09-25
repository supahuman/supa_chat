import knowledgeBaseService from '../services/knowledgeBaseService.js';

// @desc    Get knowledge base information
// @route   GET /api/bot/knowledge-base/info
// @access  Private/Admin
export const getKnowledgeBaseInfo = async (req, res) => {
  try {
    const info = await knowledgeBaseService.getKnowledgeBaseInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Load complete knowledge base (static + crawled)
// @route   POST /api/bot/knowledge-base/load
// @access  Private/Admin
export const loadCompleteKnowledgeBase = async (req, res) => {
  try {
    console.log('🔄 Loading complete knowledge base...');
    const result = await knowledgeBaseService.loadCompleteKnowledgeBase();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update knowledge base (re-crawl help center)
// @route   POST /api/bot/knowledge-base/update
// @access  Private/Admin
export const updateKnowledgeBase = async (req, res) => {
  try {
    console.log('🔄 Updating knowledge base...');
    const result = await knowledgeBaseService.updateKnowledgeBase();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Test knowledge base with sample queries
// @route   POST /api/bot/knowledge-base/test
// @access  Private/Admin
export const testKnowledgeBase = async (req, res) => {
  try {
    const result = await knowledgeBaseService.testKnowledgeBase();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Clear crawled content only
// @route   DELETE /api/bot/knowledge-base/crawled
// @access  Private/Admin
export const clearCrawledContent = async (req, res) => {
  try {
    const result = await knowledgeBaseService.clearCrawledContent();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Search knowledge base (for testing)
// @route   POST /api/bot/knowledge-base/search
// @access  Private/Admin
export const searchKnowledgeBase = async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const vectorDBService = (await import('../services/vectorDBService.js'))
      .default;
    const result = await vectorDBService.searchSimilar(query, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get crawling statistics
// @route   GET /api/bot/knowledge-base/crawl-stats
// @access  Private/Admin
export const getCrawlStats = async (req, res) => {
  try {
    const webCrawlerService = (await import('../services/webCrawlerService.js'))
      .default;
    const stats = webCrawlerService.getStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
