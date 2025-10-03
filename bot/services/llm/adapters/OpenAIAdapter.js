import OpenAI from 'openai';
import LLMInterface from '../LLMInterface.js';

/**
 * OpenAI LLM adapter implementation
 * Handles OpenAI-specific API interactions
 */
class OpenAIAdapter extends LLMInterface {
  constructor(config) {
    super();
    this.config = config;
    this.initialized = false;
  }

  async initialize(config = this.config) {
    try {
      if (!config.apiKey) {
        throw new Error('OpenAI API key is required');
      }

      this.openai = new OpenAI({
        apiKey: config.apiKey,
      });
      
      this.model = config.model || 'gpt-3.5-turbo';
      this.embeddingModel = config.embeddingModel || 'text-embedding-3-small';
      this.initialized = true;
      
      console.log('✅ OpenAI adapter initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI adapter:', error.message);
      this.initialized = false;
      throw error;
    }
  }

  async generateResponse(messages, options = {}) {
    if (!this.initialized) {
      return {
        success: false,
        error: 'OpenAI adapter not initialized',
        content: 'I apologize, but the AI service is currently unavailable.',
      };
    }

    const {
      temperature = 0.7,
      maxTokens = 500,
      topP = 1,
      stream = false,
    } = options;

    try {
      const completion = await this.openai.chat.completions.create({
        messages,
        model: this.model,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream,
      });

      return {
        success: true,
        content: completion.choices[0]?.message?.content || '',
        model: this.model,
        usage: completion.usage,
        finishReason: completion.choices[0]?.finish_reason,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        success: false,
        error: error.message,
        content: "I apologize, but I'm having trouble processing your request right now.",
        provider: 'openai'
      };
    }
  }

  async generateEmbeddings(text) {
    if (!this.initialized) {
      return {
        success: false,
        error: 'OpenAI adapter not initialized',
      };
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });

      return {
        success: true,
        embedding: response.data[0].embedding,
        model: this.embeddingModel,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI embeddings error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'openai'
      };
    }
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
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  getProviderInfo() {
    return {
      provider: 'openai',
      model: this.model,
      embeddingModel: this.embeddingModel,
      initialized: this.initialized,
      supportsEmbeddings: true
    };
  }
}

export default OpenAIAdapter;
