import ChunkingStrategyManager from '../services/chunkingStrategyManager.js';

const manager = new ChunkingStrategyManager();

/**
 * Get current chunking strategy status
 */
export const getStrategyStatus = async (req, res) => {
  try {
    const status = await manager.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting strategy status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Switch chunking strategy
 */
export const switchStrategy = async (req, res) => {
  try {
    const { strategy, force = false, reload = true } = req.body;
    
    if (!strategy || !['custom', 'langchain'].includes(strategy)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid strategy. Must be "custom" or "langchain"'
      });
    }
    
    const result = await manager.switchStrategy(strategy, { force, reload });
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        newStrategy: result.newStrategy
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error switching strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Clean knowledge base database
 */
export const cleanDatabase = async (req, res) => {
  try {
    const { force = false } = req.body;
    
    if (!force) {
      return res.status(400).json({
        success: false,
        error: 'Force flag required to clean database'
      });
    }
    
    const result = await manager.cleanDatabase();
    
    if (result.success) {
      res.json({
        success: true,
        message: `Cleaned database: ${result.deletedCount} documents deleted`,
        deletedCount: result.deletedCount
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error cleaning database:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Reload knowledge base
 */
export const reloadKnowledgeBase = async (req, res) => {
  try {
    const result = await manager.reloadKnowledgeBase();
    
    if (result.success) {
      res.json({
        success: true,
        message: `Knowledge base reloaded: ${result.count} chunks`,
        count: result.count
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error reloading knowledge base:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Validate database consistency
 */
export const validateDatabase = async (req, res) => {
  try {
    const validation = await manager.validateDatabase();
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validating database:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get chunking configuration
 */
export const getChunkingConfig = async (req, res) => {
  try {
    const config = manager.getChunkingConfig();
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting chunking config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
