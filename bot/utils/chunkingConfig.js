/**
 * Chunking Configuration Utility
 * Provides easy methods to control chunking strategy
 */

class ChunkingConfig {
  constructor() {
    this.strategies = {
      custom: {
        name: 'Custom Chunking',
        description: 'Fast, lightweight chunking for markdown files',
        supportedTypes: ['md', 'txt'],
        chunkSize: 500,
        chunkOverlap: 100,
        features: ['Markdown parsing', 'Section-based chunking', 'Category detection']
      },
      langchain: {
        name: 'LangChain Chunking',
        description: 'Enterprise-grade multi-format document processing',
        supportedTypes: ['txt', 'md', 'pdf', 'docx', 'csv', 'json', 'html'],
        chunkSize: 1000,
        chunkOverlap: 200,
        features: [
          'PDF text extraction',
          'Word document processing',
          'CSV data parsing',
          'JSON structure analysis',
          'HTML content extraction',
          'Advanced text splitting',
          'Metadata extraction'
        ]
      }
    };
  }

  /**
   * Get current strategy from environment
   */
  getCurrentStrategy() {
    return process.env.CHUNKING_STRATEGY || 'custom';
  }

  /**
   * Get strategy information
   */
  getStrategyInfo(strategy = null) {
    const currentStrategy = strategy || this.getCurrentStrategy();
    return this.strategies[currentStrategy] || null;
  }

  /**
   * Get all available strategies
   */
  getAllStrategies() {
    return Object.keys(this.strategies).map(key => ({
      key,
      ...this.strategies[key]
    }));
  }

  /**
   * Check if a file type is supported by current strategy
   */
  isFileTypeSupported(fileType, strategy = null) {
    const currentStrategy = strategy || this.getCurrentStrategy();
    const strategyInfo = this.strategies[currentStrategy];
    return strategyInfo ? strategyInfo.supportedTypes.includes(fileType) : false;
  }

  /**
   * Get environment variables for a strategy
   */
  getEnvVars(strategy) {
    const baseVars = {
      CHUNKING_STRATEGY: strategy
    };

    if (strategy === 'langchain') {
      return {
        ...baseVars,
        LANGCHAIN_CHUNK_SIZE: this.strategies.langchain.chunkSize,
        LANGCHAIN_CHUNK_OVERLAP: this.strategies.langchain.chunkOverlap,
        LANGCHAIN_SUPPORTED_TYPES: this.strategies.langchain.supportedTypes.join(',')
      };
    }

    return baseVars;
  }

  /**
   * Generate configuration summary
   */
  getConfigSummary() {
    const current = this.getCurrentStrategy();
    const info = this.getStrategyInfo(current);
    
    return {
      current: current,
      info: info,
      available: this.getAllStrategies(),
      envVars: this.getEnvVars(current)
    };
  }

  /**
   * Validate strategy configuration
   */
  validateConfig(strategy, config = {}) {
    const errors = [];
    
    if (!this.strategies[strategy]) {
      errors.push(`Invalid strategy: ${strategy}`);
      return { valid: false, errors };
    }

    if (strategy === 'langchain') {
      if (config.chunkSize && (config.chunkSize < 100 || config.chunkSize > 10000)) {
        errors.push('Chunk size must be between 100 and 10000');
      }
      
      if (config.chunkOverlap && (config.chunkOverlap < 0 || config.chunkOverlap >= (config.chunkSize || 1000))) {
        errors.push('Chunk overlap must be less than chunk size');
      }
      
      if (config.supportedTypes && !Array.isArray(config.supportedTypes)) {
        errors.push('Supported types must be an array');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new ChunkingConfig();
