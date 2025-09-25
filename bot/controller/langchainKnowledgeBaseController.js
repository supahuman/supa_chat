import vectorDBService from '../services/vectorDBService.js';
import LangChainChunkingService from '../services/langchainChunkingService.js';
import chunkingConfig from '../utils/chunkingConfig.js';

// @desc    Process client documents with LangChain
// @route   POST /api/bot/knowledge-base/langchain/process
// @access  Private
export const processClientDocuments = async (req, res) => {
  try {
    const { filePaths, options = {} } = req.body;
    
    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'filePaths array is required'
      });
    }

    // Check if LangChain is enabled
    if (vectorDBService.chunkingStrategy !== 'langchain') {
      return res.status(400).json({
        success: false,
        error: 'LangChain chunking is not enabled. Set CHUNKING_STRATEGY=langchain'
      });
    }

    // Initialize vector DB service if needed
    if (!vectorDBService.initialized) {
      await vectorDBService.initialize();
    }

    const result = await vectorDBService.processClientDocuments(filePaths, options);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error processing client documents:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get supported file types for LangChain processing
// @route   GET /api/bot/knowledge-base/langchain/supported-types
// @access  Private
export const getSupportedFileTypes = async (req, res) => {
  try {
    const supportedTypes = chunkingConfig.getStrategyInfo('langchain')?.supportedTypes || [];
    
    res.json({
      success: true,
      supportedTypes,
      strategy: 'langchain',
      isEnabled: vectorDBService.chunkingStrategy === 'langchain'
    });
  } catch (error) {
    console.error('Error getting supported file types:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get LangChain chunking configuration
// @route   GET /api/bot/knowledge-base/langchain/config
// @access  Private
export const getLangChainConfig = async (req, res) => {
  try {
    const config = chunkingConfig.getStrategyInfo('langchain');
    const isEnabled = vectorDBService.chunkingStrategy === 'langchain';
    
    res.json({
      success: true,
      isEnabled,
      config: config || null,
      currentConfig: isEnabled ? {
        chunkSize: vectorDBService.langchainChunker?.options.chunkSize,
        chunkOverlap: vectorDBService.langchainChunker?.options.chunkOverlap,
        supportedTypes: vectorDBService.langchainChunker?.options.supportedTypes
      } : null
    });
  } catch (error) {
    console.error('Error getting LangChain config:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update LangChain chunking configuration
// @route   PUT /api/bot/knowledge-base/langchain/config
// @access  Private/Admin
export const updateLangChainConfig = async (req, res) => {
  try {
    const { chunkSize, chunkOverlap, supportedTypes } = req.body;
    
    // Validate configuration
    const config = { chunkSize, chunkOverlap, supportedTypes };
    const validation = chunkingConfig.validateConfig('langchain', config);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration',
        details: validation.errors
      });
    }

    // Initialize vector DB service if needed
    if (!vectorDBService.initialized) {
      await vectorDBService.initialize();
    }

    // Switch to LangChain strategy if not already enabled
    if (vectorDBService.chunkingStrategy !== 'langchain') {
      vectorDBService.chunkingStrategy = 'langchain';
    }

    // Update LangChain chunker configuration
    vectorDBService.langchainChunker = new LangChainChunkingService({
      chunkSize: chunkSize || 1000,
      chunkOverlap: chunkOverlap || 200,
      supportedTypes: supportedTypes || ['txt', 'md', 'pdf', 'docx', 'csv', 'json', 'html']
    });

    res.json({
      success: true,
      message: 'LangChain configuration updated successfully',
      config: {
        chunkSize: vectorDBService.langchainChunker.options.chunkSize,
        chunkOverlap: vectorDBService.langchainChunker.options.chunkOverlap,
        supportedTypes: vectorDBService.langchainChunker.options.supportedTypes
      }
    });
  } catch (error) {
    console.error('Error updating LangChain config:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Test LangChain document processing
// @route   POST /api/bot/knowledge-base/langchain/test
// @access  Private/Admin
export const testLangChainProcessing = async (req, res) => {
  try {
    const { filePath, testContent } = req.body;
    
    if (!filePath && !testContent) {
      return res.status(400).json({
        success: false,
        error: 'Either filePath or testContent is required'
      });
    }

    // Create a temporary LangChain chunker for testing
    const testChunker = new LangChainChunkingService({
      chunkSize: 500, // Smaller chunks for testing
      chunkOverlap: 100,
      supportedTypes: ['txt', 'md', 'pdf', 'docx', 'csv', 'json', 'html']
    });

    let chunks = [];
    
    if (filePath) {
      // Test with actual file
      chunks = await testChunker.processDocument(filePath);
    } else {
      // Test with provided content
      const fs = await import('fs/promises');
      const path = await import('path');
      const os = await import('os');
      
      // Create temporary file
      const tempDir = os.tmpdir();
      const tempFile = path.join(tempDir, `test-${Date.now()}.txt`);
      
      try {
        await fs.writeFile(tempFile, testContent, 'utf-8');
        chunks = await testChunker.processDocument(tempFile);
        await fs.unlink(tempFile); // Clean up
      } catch (error) {
        if (await fs.access(tempFile).then(() => true).catch(() => false)) {
          await fs.unlink(tempFile); // Clean up on error
        }
        throw error;
      }
    }

    res.json({
      success: true,
      chunks: chunks.map(chunk => ({
        content: chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''),
        title: chunk.title,
        category: chunk.metadata.category,
        fileType: chunk.metadata.fileType,
        chunkIndex: chunk.metadata.chunkIndex
      })),
      totalChunks: chunks.length,
      summary: {
        totalCharacters: chunks.reduce((sum, chunk) => sum + chunk.content.length, 0),
        averageChunkSize: Math.round(chunks.reduce((sum, chunk) => sum + chunk.content.length, 0) / chunks.length),
        categories: [...new Set(chunks.map(chunk => chunk.metadata.category))]
      }
    });
  } catch (error) {
    console.error('Error testing LangChain processing:', error);
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
    // Initialize vector DB service if needed
    if (!vectorDBService.initialized) {
      await vectorDBService.initialize();
    }

    const stats = await vectorDBService.getKnowledgeBaseStats();
    
    if (!stats.success) {
      return res.status(500).json(stats);
    }

    // Filter for LangChain processed documents
    const langchainStats = {
      totalDocuments: stats.totalChunks,
      langchainDocuments: 0,
      customDocuments: 0,
      categories: stats.categories,
      chunkingInfo: stats.chunkingInfo
    };

    // This would require a database query to count by source
    // For now, we'll return the basic stats
    res.json({
      success: true,
      ...langchainStats,
      isLangChainEnabled: vectorDBService.chunkingStrategy === 'langchain'
    });
  } catch (error) {
    console.error('Error getting LangChain stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Enable/disable LangChain chunking
// @route   POST /api/bot/knowledge-base/langchain/toggle
// @access  Private/Admin
export const toggleLangChain = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled must be a boolean value'
      });
    }

    // Initialize vector DB service if needed
    if (!vectorDBService.initialized) {
      await vectorDBService.initialize();
    }

    if (enabled) {
      // Enable LangChain
      vectorDBService.chunkingStrategy = 'langchain';
      vectorDBService.langchainChunker = new LangChainChunkingService();
    } else {
      // Disable LangChain (switch to custom)
      vectorDBService.chunkingStrategy = 'custom';
      vectorDBService.langchainChunker = null;
    }

    res.json({
      success: true,
      message: `LangChain chunking ${enabled ? 'enabled' : 'disabled'}`,
      currentStrategy: vectorDBService.chunkingStrategy,
      isLangChainEnabled: enabled
    });
  } catch (error) {
    console.error('Error toggling LangChain:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
