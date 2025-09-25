import { Groq } from 'groq-sdk';

class GroqService {
  constructor() {
    this.initialized = false;
    this.initialize();
  }

  initialize() {
    try {
      if (!process.env.GROQ_API_KEY) {
        console.warn('⚠️ GROQ_API_KEY not found in environment variables');
        return;
      }

      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
      this.model = 'llama-3.1-8b-instant'; // Updated to current model
      this.initialized = true;
      console.log('✅ Groq service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Groq service:', error.message);
      this.initialized = false;
    }
  }

  async generateResponse(messages, options = {}) {
    if (!this.initialized) {
      return {
        success: false,
        error:
          'Groq service not initialized. Check GROQ_API_KEY environment variable.',
        content:
          'I apologize, but the AI service is currently unavailable. Please try again later.',
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
      };
    } catch (error) {
      console.error('Groq API error:', error);
      return {
        success: false,
        error: error.message,
        content:
          "I apologize, but I'm having trouble processing your request right now. Please try again later.",
      };
    }
  }

  async generateEmbeddings(text) {
    if (!this.initialized) {
      return {
        success: false,
        error: 'Groq service not initialized',
      };
    }

    // Groq doesn't have a native embeddings API like OpenAI
    // For now, we'll use a simple approach or disable RAG
    try {
      // Simple fallback: return a mock embedding or use a different approach
      // This is a temporary solution until we implement proper embeddings
      console.log('⚠️ Groq embeddings not available, using fallback');

      return {
        success: true,
        embedding: [], // Empty embedding for now
        fallback: true,
      };
    } catch (error) {
      console.error('Embedding generation error:', error);
      return {
        success: false,
        error: error.message,
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
      console.error('Groq connection test failed:', error);
      return false;
    }
  }
}

export default new GroqService();
