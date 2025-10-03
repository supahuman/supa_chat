import { Groq } from 'groq-sdk';
import LLMInterface from '../LLMInterface.js';

/**
 * Groq LLM adapter implementation
 * Handles Groq-specific API interactions
 */
class GroqAdapter extends LLMInterface {
  constructor(config) {
    super();
    this.config = config;
    this.initialized = false;
  }

  async initialize(config = this.config) {
    try {
      if (!config.apiKey) {
        throw new Error('Groq API key is required');
      }

      this.groq = new Groq({
        apiKey: config.apiKey,
      });
      
      this.model = config.model || 'llama-3.1-8b-instant';
      this.initialized = true;
      
      console.log('✅ Groq adapter initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Groq adapter:', error.message);
      this.initialized = false;
      throw error;
    }
  }

  async generateResponse(messages, options = {}) {
    if (!this.initialized) {
      return {
        success: false,
        error: 'Groq adapter not initialized',
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
      const completion = await this.groq.chat.completions.create({
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
        provider: 'groq'
      };
    } catch (error) {
      console.error('Groq API error:', error);
      return {
        success: false,
        error: error.message,
        content: "I apologize, but I'm having trouble processing your request right now.",
        provider: 'groq'
      };
    }
  }

  async generateEmbeddings(text) {
    // Groq doesn't have native embeddings, so we'll use a fallback
    console.warn('⚠️ Groq does not support embeddings, using fallback');
    return {
      success: true,
      embedding: [], // Empty embedding for now
      fallback: true,
      provider: 'groq'
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
      console.error('Groq connection test failed:', error);
      return false;
    }
  }

  getProviderInfo() {
    return {
      provider: 'groq',
      model: this.model,
      initialized: this.initialized,
      supportsEmbeddings: false
    };
  }
}

export default GroqAdapter;
