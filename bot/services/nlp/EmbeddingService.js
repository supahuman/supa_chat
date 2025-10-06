import { OpenAIEmbeddings } from '@langchain/openai';
import { CohereEmbeddings } from '@langchain/cohere';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';

/**
 * EmbeddingService - Handles vector embeddings using LangChain
 * Supports multiple embedding providers with fallback options
 */
class EmbeddingService {
  constructor(options = {}) {
    this.options = {
      // Default embedding provider
      provider: options.provider || process.env.EMBEDDING_PROVIDER || 'openai',
      
      // Provider-specific configurations
      openai: {
        model: options.openai?.model || 'text-embedding-3-small',
        dimensions: options.openai?.dimensions || 1536,
        batchSize: options.openai?.batchSize || 100,
        ...options.openai
      },
      
      cohere: {
        model: options.cohere?.model || 'embed-english-v3.0',
        batchSize: options.cohere?.batchSize || 100,
        ...options.cohere
      },
      
      huggingface: {
        model: options.huggingface?.model || 'sentence-transformers/all-MiniLM-L6-v2',
        batchSize: options.huggingface?.batchSize || 50,
        ...options.huggingface
      },
      
      // General options
      maxRetries: options.maxRetries || 3,
      timeout: options.timeout || 30000,
      
      ...options
    };

    // Initialize the embedding model lazily
    this.embeddings = null;
  }

  /**
   * Initialize the embedding model based on provider
   * @returns {Object} LangChain embeddings instance
   */
  initializeEmbeddings() {
    const provider = this.options.provider.toLowerCase();
    
    try {
      switch (provider) {
        case 'openai':
          return new OpenAIEmbeddings({
            modelName: this.options.openai.model,
            dimensions: this.options.openai.dimensions,
            batchSize: this.options.openai.batchSize,
            maxRetries: this.options.maxRetries,
            timeout: this.options.timeout,
            openAIApiKey: process.env.OPENAI_API_KEY
          });

        case 'cohere':
          return new CohereEmbeddings({
            model: this.options.cohere.model,
            batchSize: this.options.cohere.batchSize,
            maxRetries: this.options.maxRetries,
            timeout: this.options.timeout,
            apiKey: process.env.COHERE_API_KEY
          });

        case 'huggingface':
          return new HuggingFaceInferenceEmbeddings({
            model: this.options.huggingface.model,
            batchSize: this.options.huggingface.batchSize,
            maxRetries: this.options.maxRetries,
            timeout: this.options.timeout,
            apiKey: process.env.HUGGINGFACE_API_KEY
          });

        default:
          throw new Error(`Unsupported embedding provider: ${provider}`);
      }
    } catch (error) {
      console.error(`❌ Failed to initialize ${provider} embeddings:`, error.message);
      throw error;
    }
  }

  /**
   * Ensure embeddings are initialized
   */
  ensureEmbeddingsInitialized() {
    if (!this.embeddings) {
      this.embeddings = this.initializeEmbeddings();
    }
  }

  /**
   * Generate embeddings for text content
   * @param {string|Array} texts - Text or array of texts to embed
   * @param {Object} options - Additional options
   * @returns {Array} Array of embedding vectors
   */
  async generateEmbeddings(texts, options = {}) {
    try {
      // Ensure embeddings are initialized
      this.ensureEmbeddingsInitialized();

      // Normalize input to array
      const textArray = Array.isArray(texts) ? texts : [texts];
      
      if (textArray.length === 0) {
        throw new Error('No texts provided for embedding');
      }

      console.log(`🔮 Generating embeddings for ${textArray.length} texts using ${this.options.provider}`);

      // Generate embeddings
      const embeddings = await this.embeddings.embedDocuments(textArray);

      console.log(`✅ Generated ${embeddings.length} embeddings (dimension: ${embeddings[0]?.length || 'unknown'})`);
      return embeddings;

    } catch (error) {
      console.error('❌ Error generating embeddings:', error.message);
      throw error;
    }
  }

  /**
   * Generate embedding for a single text
   * @param {string} text - Text to embed
   * @param {Object} options - Additional options
   * @returns {Array} Embedding vector
   */
  async generateEmbedding(text, options = {}) {
    try {
      // Ensure embeddings are initialized
      this.ensureEmbeddingsInitialized();

      if (!text || typeof text !== 'string') {
        throw new Error('Text is required and must be a string');
      }

      console.log(`🔮 Generating embedding for text (${text.length} chars) using ${this.options.provider}`);

      const embedding = await this.embeddings.embedQuery(text);

      console.log(`✅ Generated embedding (dimension: ${embedding.length})`);
      return embedding;

    } catch (error) {
      console.error('❌ Error generating embedding:', error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for documents with metadata
   * @param {Array} documents - Array of document objects with pageContent
   * @param {Object} options - Additional options
   * @returns {Array} Array of documents with embeddings added
   */
  async embedDocuments(documents, options = {}) {
    try {
      // Ensure embeddings are initialized
      this.ensureEmbeddingsInitialized();

      if (!Array.isArray(documents)) {
        throw new Error('Documents must be an array');
      }

      if (documents.length === 0) {
        return [];
      }

      console.log(`🔮 Embedding ${documents.length} documents using ${this.options.provider}`);

      // Extract text content
      const texts = documents.map(doc => doc.pageContent || doc.content || '');
      
      // Generate embeddings
      const embeddings = await this.generateEmbeddings(texts, options);

      // Combine documents with embeddings
      const embeddedDocuments = documents.map((doc, index) => ({
        ...doc,
        embedding: embeddings[index],
        metadata: {
          ...doc.metadata,
          embeddingProvider: this.options.provider,
          embeddingModel: this.getModelName(),
          embeddingDimension: embeddings[index]?.length || 0,
          embeddedAt: new Date().toISOString()
        }
      }));

      console.log(`✅ Successfully embedded ${embeddedDocuments.length} documents`);
      return embeddedDocuments;

    } catch (error) {
      console.error('❌ Error embedding documents:', error.message);
      throw error;
    }
  }

  /**
   * Get the current model name
   * @returns {string} Model name
   */
  getModelName() {
    switch (this.options.provider.toLowerCase()) {
      case 'openai':
        return this.options.openai.model;
      case 'cohere':
        return this.options.cohere.model;
      case 'huggingface':
        return this.options.huggingface.model;
      default:
        return 'unknown';
    }
  }

  /**
   * Get embedding dimension for current provider
   * @returns {number} Embedding dimension
   */
  getEmbeddingDimension() {
    switch (this.options.provider.toLowerCase()) {
      case 'openai':
        return this.options.openai.dimensions;
      case 'cohere':
        return 1024; // Cohere embed-english-v3.0 dimension
      case 'huggingface':
        return 384; // all-MiniLM-L6-v2 dimension
      default:
        return 0;
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   * @param {Array} embedding1 - First embedding vector
   * @param {Array} embedding2 - Second embedding vector
   * @returns {number} Cosine similarity score (-1 to 1)
   */
  calculateSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2) {
      throw new Error('Both embeddings are required');
    }

    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
    }

    // Calculate magnitudes
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));

    // Calculate cosine similarity
    const similarity = dotProduct / (magnitude1 * magnitude2);
    return similarity;
  }

  /**
   * Update embedding configuration
   * @param {Object} newOptions - New embedding options
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.embeddings = null; // Reset to force re-initialization
    console.log(`⚙️ Updated embedding config: provider=${this.options.provider}`);
  }

  /**
   * Get current configuration
   * @returns {Object} Current embedding configuration
   */
  getConfig() {
    return {
      provider: this.options.provider,
      model: this.getModelName(),
      dimension: this.getEmbeddingDimension(),
      ...this.options
    };
  }

  /**
   * Test embedding service
   * @returns {Object} Test results
   */
  async test() {
    try {
      // Ensure embeddings are initialized
      this.ensureEmbeddingsInitialized();
      
      const testText = "This is a test text for embedding generation.";
      const embedding = await this.generateEmbedding(testText);
      
      return {
        success: true,
        provider: this.options.provider,
        model: this.getModelName(),
        dimension: embedding.length,
        testText,
        message: 'Embedding service is working correctly'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Embedding service test failed'
      };
    }
  }
}

export default EmbeddingService;
