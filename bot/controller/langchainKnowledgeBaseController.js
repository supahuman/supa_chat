import LangChainChunkingService from '../services/langchainChunkingService.js';
import chunkingConfig from '../utils/chunkingConfig.js';
import ClientConfigService from '../services/client/ClientConfigService.js';
import DatabaseFactory from '../services/database/DatabaseFactory.js';

// @desc    Process client documents with LangChain
// @route   POST /api/bot/knowledge-base/langchain/process
// @access  Private
export const processClientDocuments = async (req, res) => {
  try {
    const { filePaths, options = {} } = req.body;
    const { clientId = 'supa-chat' } = req.params;

    if (!filePaths || !Array.isArray(filePaths)) {
      return res.status(400).json({
        success: false,
        error: 'filePaths array is required',
      });
    }

    console.log(`🔗 Processing ${filePaths.length} documents for client ${clientId} with LangChain`);

    // Get client configuration
    const clientConfigService = new ClientConfigService();
    const clientConfig = clientConfigService.getClientConfig(clientId);
    
    if (!clientConfig) {
      return res.status(404).json({
        success: false,
        error: 'Client configuration not found',
      });
    }

    // Create database connection for client
    const vectorDB = DatabaseFactory.create(clientConfig.vectorDB.type, clientConfig.vectorDB);
    await vectorDB.connect();

    // Initialize LangChain chunking service
    const langchainService = new LangChainChunkingService();
    
    const results = [];
    let totalChunks = 0;

    for (const filePath of filePaths) {
      try {
        console.log(`📄 Processing: ${filePath}`);
        
        // Process document with LangChain
        const chunks = await langchainService.processDocument(filePath, options);
        
        if (chunks && chunks.length > 0) {
          // Add documents to client's database
          const addResult = await vectorDB.addDocuments(chunks);
          
          if (addResult.success) {
            results.push({
              filePath,
              success: true,
              chunks: chunks.length,
              added: addResult.count
            });
            totalChunks += chunks.length;
          } else {
            results.push({
              filePath,
              success: false,
              error: addResult.error
            });
          }
        } else {
          results.push({
            filePath,
            success: false,
            error: 'No chunks generated'
          });
        }
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        results.push({
          filePath,
          success: false,
          error: error.message
        });
      }
    }

    await vectorDB.disconnect();

    res.json({
      success: true,
      message: `Processed ${filePaths.length} documents for client ${clientId}`,
      results,
      totalChunks,
      clientId
    });

  } catch (error) {
    console.error('❌ LangChain document processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// @desc    Get supported file types for LangChain processing
// @route   GET /api/bot/knowledge-base/langchain/supported-types
// @access  Private
export const getSupportedFileTypes = async (req, res) => {
  try {
    const supportedTypes = chunkingConfig.getSupportedFileTypes();
    
    res.json({
      success: true,
      supportedTypes,
      message: 'LangChain supported file types retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting supported file types:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// @desc    Get LangChain chunking configuration
// @route   GET /api/bot/knowledge-base/langchain/config
// @access  Private
export const getChunkingInfo = async (req, res) => {
  try {
    const config = chunkingConfig.getLangChainConfig();
    
    res.json({
      success: true,
      config,
      message: 'LangChain configuration retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting chunking info:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// @desc    Update LangChain chunking configuration
// @route   PUT /api/bot/knowledge-base/langchain/config
// @access  Private
export const updateChunkingConfig = async (req, res) => {
  try {
    const { chunkSize, chunkOverlap, supportedTypes } = req.body;
    
    const updateResult = chunkingConfig.updateLangChainConfig({
      chunkSize,
      chunkOverlap,
      supportedTypes
    });
    
    if (updateResult.success) {
      res.json({
        success: true,
        message: 'LangChain configuration updated successfully',
        config: updateResult.config
      });
    } else {
      res.status(400).json({
        success: false,
        error: updateResult.error
      });
    }
  } catch (error) {
    console.error('❌ Error updating chunking config:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// @desc    Test LangChain document processing
// @route   POST /api/bot/knowledge-base/langchain/test
// @access  Private
export const testLangChainProcessing = async (req, res) => {
  try {
    const { filePath, options = {} } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'filePath is required',
      });
    }

    console.log(`🧪 Testing LangChain processing for: ${filePath}`);
    
    const langchainService = new LangChainChunkingService();
    const chunks = await langchainService.processDocument(filePath, options);
    
    res.json({
      success: true,
      message: 'LangChain processing test completed',
      filePath,
      chunksGenerated: chunks ? chunks.length : 0,
      sampleChunk: chunks && chunks.length > 0 ? chunks[0] : null
    });
    
  } catch (error) {
    console.error('❌ LangChain test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get LangChain processing statistics
// @route   GET /api/bot/knowledge-base/langchain/stats
// @access  Private
export const getLangChainStats = async (req, res) => {
  try {
    const { clientId = 'supa-chat' } = req.params;
    
    // Get client configuration
    const clientConfigService = new ClientConfigService();
    const clientConfig = clientConfigService.getClientConfig(clientId);
    
    if (!clientConfig) {
      return res.status(404).json({
        success: false,
        error: 'Client configuration not found',
      });
    }

    // Get database stats
    const vectorDB = DatabaseFactory.create(clientConfig.vectorDB.type, clientConfig.vectorDB);
    await vectorDB.connect();
    const stats = await vectorDB.getStats();
    await vectorDB.disconnect();
    
    res.json({
      success: true,
      message: 'LangChain statistics retrieved successfully',
      clientId,
      stats,
      config: chunkingConfig.getLangChainConfig()
    });
    
  } catch (error) {
    console.error('❌ Error getting LangChain stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// @desc    Toggle LangChain processing on/off
// @route   POST /api/bot/knowledge-base/langchain/toggle
// @access  Private
export const toggleLangChainEnabled = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled must be a boolean value',
      });
    }

    const updateResult = chunkingConfig.toggleLangChainEnabled(enabled);
    
    res.json({
      success: true,
      message: `LangChain processing ${enabled ? 'enabled' : 'disabled'}`,
      enabled: updateResult.enabled,
      config: updateResult.config
    });
    
  } catch (error) {
    console.error('❌ Error toggling LangChain:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
