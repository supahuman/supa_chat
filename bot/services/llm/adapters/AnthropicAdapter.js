import Anthropic from '@anthropic-ai/sdk';
import LLMInterface from '../LLMInterface.js';

/**
 * Anthropic LLM adapter implementation
 * Handles Anthropic Claude API interactions
 */
class AnthropicAdapter extends LLMInterface {
  constructor(config) {
    super();
    this.config = config;
    this.initialized = false;
  }

  async initialize(config = this.config) {
    try {
      if (!config.apiKey) {
        throw new Error('Anthropic API key is required');
      }

      this.anthropic = new Anthropic({
        apiKey: config.apiKey,
      });
      
      this.model = config.model || 'claude-3-haiku-20240307';
      this.initialized = true;
      
      console.log('✅ Anthropic adapter initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Anthropic adapter:', error.message);
      this.initialized = false;
      throw error;
    }
  }

  async generateResponse(messages, options = {}) {
    if (!this.initialized) {
      return {
        success: false,
        error: 'Anthropic adapter not initialized',
        content: 'I apologize, but the AI service is currently unavailable.',
      };
    }

    const {
      temperature = 0.7,
      maxTokens = 500,
    } = options;

    try {
      // Convert messages to Anthropic format
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');
      
      const lastUserMessage = userMessages[userMessages.length - 1];
      const conversationHistory = userMessages.slice(0, -1);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage?.content || '',
        messages: conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        ...(lastUserMessage && {
          messages: [
            ...conversationHistory.map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content
            })),
            {
              role: 'user',
              content: lastUserMessage.content
            }
          ]
        })
      });

      return {
        success: true,
        content: response.content[0]?.text || '',
        model: this.model,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        },
        finishReason: response.stop_reason,
        provider: 'anthropic'
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      return {
        success: false,
        error: error.message,
        content: "I apologize, but I'm having trouble processing your request right now.",
        provider: 'anthropic'
      };
    }
  }

  async generateEmbeddings(text) {
    // Anthropic doesn't have native embeddings
    console.warn('⚠️ Anthropic does not support embeddings, using fallback');
    return {
      success: true,
      embedding: [], // Empty embedding for now
      fallback: true,
      provider: 'anthropic'
    };
  }

  async testConnection() {
    if (!this.initialized) {
      return false;
    }

    try {
      const response = await this.generateResponse(
        [{ role: 'user', content: 'Hello, this is a test message.' }],
        { maxTokens: 10 }
      );
      return response.success;
    } catch (error) {
      console.error('Anthropic connection test failed:', error);
      return false;
    }
  }

  getProviderInfo() {
    return {
      provider: 'anthropic',
      model: this.model,
      initialized: this.initialized,
      supportsEmbeddings: false
    };
  }
}

export default AnthropicAdapter;
