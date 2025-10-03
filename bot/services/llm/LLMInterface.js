/**
 * Abstract interface for all LLM providers
 * Defines the contract that all LLM adapters must implement
 */
class LLMInterface {
  /**
   * Initialize the LLM provider
   * @param {Object} config - Provider-specific configuration
   */
  async initialize(config) {
    throw new Error('Not implemented');
  }

  /**
   * Generate a response from the LLM
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Generation options
   * @returns {Object} Response object with content and metadata
   */
  async generateResponse(messages, options = {}) {
    throw new Error('Not implemented');
  }

  /**
   * Generate embeddings for text
   * @param {string|Array} text - Text to embed
   * @returns {Object} Embeddings result
   */
  async generateEmbeddings(text) {
    throw new Error('Not implemented');
  }

  /**
   * Test the connection to the LLM provider
   * @returns {boolean} Connection status
   */
  async testConnection() {
    throw new Error('Not implemented');
  }

  /**
   * Get provider information
   * @returns {Object} Provider metadata
   */
  getProviderInfo() {
    throw new Error('Not implemented');
  }
}

export default LLMInterface;
