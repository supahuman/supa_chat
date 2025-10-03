import LLMInterface from './LLMInterface.js';
import GroqAdapter from './adapters/GroqAdapter.js';
import OpenAIAdapter from './adapters/OpenAIAdapter.js';
import AnthropicAdapter from './adapters/AnthropicAdapter.js';

/**
 * Factory class for creating LLM connections
 * Centralizes LLM provider selection and configuration
 */
class LLMFactory {
  /**
   * Create an LLM connection based on provider type
   * @param {string} provider - Provider type (groq, openai, anthropic, etc.)
   * @param {Object} config - Provider-specific configuration
   * @returns {LLMInterface} LLM adapter instance
   */
  static create(provider, config) {
    if (!provider || !config) {
      throw new Error('Provider type and config are required');
    }

    switch (provider.toLowerCase()) {
      case 'groq':
        return new GroqAdapter(config);
      
      case 'openai':
        return new OpenAIAdapter(config);
      
      case 'anthropic':
        return new AnthropicAdapter(config);
      
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  /**
   * Get list of supported LLM providers
   * @returns {Array} Array of supported provider types
   */
  static getSupportedProviders() {
    return ['groq', 'openai', 'anthropic'];
  }

  /**
   * Validate LLM configuration
   * @param {string} provider - Provider type
   * @param {Object} config - Provider configuration
   * @returns {Object} Validation result
   */
  static validateConfig(provider, config) {
    const errors = [];

    if (!provider) {
      errors.push('Provider type is required');
    }

    if (!config) {
      errors.push('Provider configuration is required');
    }

    // Provider-specific validation
    switch (provider?.toLowerCase()) {
      case 'groq':
        if (!config.apiKey) {
          errors.push('Groq API key is required');
        }
        break;
      
      case 'openai':
        if (!config.apiKey) {
          errors.push('OpenAI API key is required');
        }
        break;
      
      case 'anthropic':
        if (!config.apiKey) {
          errors.push('Anthropic API key is required');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default LLMFactory;
