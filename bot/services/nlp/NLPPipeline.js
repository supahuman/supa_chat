import ChunkingService from './ChunkingService.js';
import EmbeddingService from './EmbeddingService.js';
import VectorStoreService from './VectorStoreService.js';
import QAProcessingService from '../QAProcessingService.js';

/**
 * NLPPipeline - Orchestrates the complete NLP pipeline
 * Handles: Text → Chunks → Embeddings → Vector Storage
 */
class NLPPipeline {
  constructor(options = {}) {
    this.options = {
      // Pipeline configuration
      chunkSize: options.chunkSize || 1000,
      chunkOverlap: options.chunkOverlap || 200,
      embeddingProvider: options.embeddingProvider || 'openai',
      
      // Search configuration
      similarityThreshold: options.similarityThreshold || 0.7,
      searchLimit: options.searchLimit || 10,
      
      // Processing options
      batchSize: options.batchSize || 50,
      enableLogging: options.enableLogging !== false,
      
      ...options
    };

    // Initialize services
    this.chunkingService = new ChunkingService({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap
    });

    this.embeddingService = new EmbeddingService({
      provider: this.options.embeddingProvider
    });

    this.vectorStoreService = new VectorStoreService({
      similarityThreshold: this.options.similarityThreshold,
      defaultLimit: this.options.searchLimit
    });

    this.qaProcessingService = QAProcessingService;

    this.log('🚀 NLP Pipeline initialized', {
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
      embeddingProvider: this.options.embeddingProvider
    });
  }

  /**
   * Process Q&A pairs through the NLP pipeline
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Array} qaPairs - Array of Q&A objects
   * @param {Object} options - Processing options
   * @returns {Object} Processing results
   */
  async processQAPairs(agentId, companyId, qaPairs, options = {}) {
    try {
      if (!agentId || !companyId || !qaPairs) {
        throw new Error('Agent ID, Company ID, and Q&A pairs are required');
      }

      this.log(`❓ Starting Q&A processing for agent ${agentId}`, {
        qaPairs: qaPairs.length,
        agentId,
        companyId
      });

      const startTime = Date.now();
      const results = {
        agentId,
        companyId,
        totalQAPairs: qaPairs.length,
        processedQAPairs: 0,
        totalVectors: 0,
        errors: [],
        processingTime: 0
      };

      // Step 1: Process Q&A pairs
      this.log('❓ Step 1: Processing Q&A pairs...');
      const processedQAs = await this.qaProcessingService.processQAPairs(qaPairs, agentId, companyId);
      
      if (!processedQAs.success) {
        throw new Error(`Q&A processing failed: ${processedQAs.error}`);
      }

      results.processedQAPairs = processedQAs.totalChunks;
      this.log(`✅ Processed ${processedQAs.totalChunks} Q&A pairs`);

      if (processedQAs.qaPairs.length === 0) {
        results.processingTime = Date.now() - startTime;
        results.success = true;
        return results;
      }

      // Step 2: Generate embeddings for Q&A pairs
      this.log('🔮 Step 2: Generating embeddings for Q&A pairs...');
      const embeddedQAs = await this.embedQAPairs(processedQAs.qaPairs);
      results.totalVectors = embeddedQAs.length;
      this.log(`✅ Generated ${embeddedQAs.length} embeddings for Q&A pairs`);

      // Step 3: Store Q&A vectors
      this.log('💾 Step 3: Storing Q&A vectors...');
      const storageResult = await this.vectorStoreService.storeVectors(
        agentId,
        companyId,
        embeddedQAs,
        options
      );
      this.log(`✅ Stored ${storageResult.storedCount} Q&A vectors`);

      // Calculate processing time
      results.processingTime = Date.now() - startTime;
      results.success = true;

      this.log(`🎉 Q&A processing completed for agent ${agentId}`, {
        processingTime: `${results.processingTime}ms`,
        totalQAPairs: results.totalQAPairs,
        totalVectors: results.totalVectors
      });

      return results;

    } catch (error) {
      this.log(`❌ Q&A processing failed for agent ${agentId}:`, error.message);
      throw error;
    }
  }

  /**
   * Process crawled content through the complete NLP pipeline
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Array} crawledContent - Array of crawled content objects
   * @param {Object} options - Processing options
   * @returns {Object} Processing results
   */
  async processCrawledContent(agentId, companyId, crawledContent, options = {}) {
    try {
      if (!agentId || !companyId || !crawledContent) {
        throw new Error('Agent ID, Company ID, and crawled content are required');
      }

      this.log(`🔄 Starting NLP pipeline for agent ${agentId}`, {
        contentItems: crawledContent.length,
        agentId,
        companyId
      });

      const startTime = Date.now();
      const results = {
        agentId,
        companyId,
        totalItems: crawledContent.length,
        processedItems: 0,
        totalChunks: 0,
        totalVectors: 0,
        errors: [],
        processingTime: 0
      };

      // Step 1: Chunk the content
      this.log('📝 Step 1: Chunking content...');
      const chunkedDocuments = await this.chunkContent(crawledContent);
      results.totalChunks = chunkedDocuments.length;
      this.log(`✅ Created ${chunkedDocuments.length} chunks`);

      // Step 2: Generate embeddings
      this.log('🔮 Step 2: Generating embeddings...');
      const embeddedDocuments = await this.embedDocuments(chunkedDocuments);
      results.totalVectors = embeddedDocuments.length;
      this.log(`✅ Generated ${embeddedDocuments.length} embeddings`);

      // Step 3: Store vectors
      this.log('💾 Step 3: Storing vectors...');
      const storageResult = await this.vectorStoreService.storeVectors(
        agentId,
        companyId,
        embeddedDocuments,
        options
      );
      this.log(`✅ Stored ${storageResult.storedCount} vectors`);

      // Calculate processing time
      results.processingTime = Date.now() - startTime;
      results.success = true;

      this.log(`🎉 NLP Pipeline completed for agent ${agentId}`, {
        processingTime: `${results.processingTime}ms`,
        totalChunks: results.totalChunks,
        totalVectors: results.totalVectors
      });

      return results;

    } catch (error) {
      this.log(`❌ NLP Pipeline failed for agent ${agentId}:`, error.message);
      throw error;
    }
  }

  /**
   * Chunk crawled content into smaller pieces
   * @param {Array} crawledContent - Array of crawled content
   * @returns {Array} Array of chunked documents
   */
  async chunkContent(crawledContent) {
    try {
      const allChunks = [];

      for (const item of crawledContent) {
        if (!item.content || typeof item.content !== 'string') {
          this.log(`⚠️ Skipping item with invalid content:`, item.url);
          continue;
        }

        // Prepare metadata for chunking
        const metadata = {
          type: 'url',
          url: item.url,
          title: item.title,
          category: item.category,
          source: 'crawled-url',
          originalLength: item.content.length,
          ...item.metadata
        };

        // Chunk the content
        const chunks = await this.chunkingService.chunkText(item.content, metadata);
        allChunks.push(...chunks);

        this.log(`🧩 Chunked ${item.url}: ${chunks.length} chunks from ${item.content.length} chars`);
      }

      return allChunks;

    } catch (error) {
      this.log('❌ Error chunking content:', error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for Q&A pairs
   * @param {Array} qaPairs - Array of processed Q&A pairs
   * @returns {Array} Array of Q&A pairs with embeddings
   */
  async embedQAPairs(qaPairs) {
    try {
      if (qaPairs.length === 0) {
        return [];
      }

      // Convert Q&A pairs to document format for embedding
      const documents = qaPairs.map(qa => ({
        content: qa.content,
        metadata: {
          ...qa.metadata,
          type: 'qa',
          source: 'manual-qa'
        }
      }));

      // Generate embeddings using the existing embedding service
      const embeddedDocuments = await this.embeddingService.embedDocuments(documents);

      // Convert back to Q&A format with embeddings
      return embeddedDocuments.map((doc, index) => ({
        content: doc.content,
        embedding: doc.embedding,
        metadata: {
          ...doc.metadata,
          agentId: qaPairs[index].agentId,
          companyId: qaPairs[index].companyId
        }
      }));

    } catch (error) {
      this.log('❌ Error embedding Q&A pairs:', error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for chunked documents
   * @param {Array} documents - Array of chunked documents
   * @returns {Array} Array of documents with embeddings
   */
  async embedDocuments(documents) {
    try {
      if (documents.length === 0) {
        return [];
      }

      // Process in batches to avoid rate limits
      const batchSize = this.options.batchSize;
      const batches = [];
      
      for (let i = 0; i < documents.length; i += batchSize) {
        batches.push(documents.slice(i, i + batchSize));
      }

      const allEmbeddedDocuments = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        this.log(`🔮 Processing embedding batch ${i + 1}/${batches.length} (${batch.length} documents)`);
        
        const embeddedBatch = await this.embeddingService.embedDocuments(batch);
        allEmbeddedDocuments.push(...embeddedBatch);
        
        // Add small delay between batches to be respectful to API limits
        if (i < batches.length - 1) {
          await this.delay(100);
        }
      }

      return allEmbeddedDocuments;

    } catch (error) {
      this.log('❌ Error embedding documents:', error.message);
      throw error;
    }
  }

  /**
   * Search for similar content using semantic search
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Array of similar content with scores
   */
  async searchSimilar(agentId, companyId, query, options = {}) {
    try {
      if (!agentId || !companyId || !query) {
        throw new Error('Agent ID, Company ID, and query are required');
      }

      this.log(`🔍 Searching for: "${query}"`);

      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Search for similar vectors
      const similarVectors = await this.vectorStoreService.searchSimilar(
        agentId,
        companyId,
        queryEmbedding,
        options
      );

      this.log(`✅ Found ${similarVectors.length} similar results`);
      return similarVectors;

    } catch (error) {
      this.log('❌ Error searching similar content:', error.message);
      throw error;
    }
  }

  /**
   * Get knowledge base statistics for an agent
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @returns {Object} Knowledge base statistics
   */
  async getKnowledgeBaseStats(agentId, companyId) {
    try {
      const vectorStats = await this.vectorStoreService.getVectorStats(agentId, companyId);
      
      return {
        agentId,
        companyId,
        ...vectorStats,
        pipeline: {
          chunkSize: this.options.chunkSize,
          chunkOverlap: this.options.chunkOverlap,
          embeddingProvider: this.options.embeddingProvider,
          embeddingModel: this.embeddingService.getModelName(),
          embeddingDimension: this.embeddingService.getEmbeddingDimension()
        }
      };

    } catch (error) {
      this.log('❌ Error getting knowledge base stats:', error.message);
      throw error;
    }
  }

  /**
   * Clear knowledge base for an agent
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Object} options - Clear options
   * @returns {Object} Clear results
   */
  async clearKnowledgeBase(agentId, companyId, options = {}) {
    try {
      this.log(`🗑️ Clearing knowledge base for agent ${agentId}`);
      
      const result = await this.vectorStoreService.deleteVectors(agentId, companyId, options);
      
      this.log(`✅ Cleared ${result.deletedCount} vectors for agent ${agentId}`);
      return result;

    } catch (error) {
      this.log('❌ Error clearing knowledge base:', error.message);
      throw error;
    }
  }

  /**
   * Test the complete NLP pipeline
   * @returns {Object} Test results
   */
  async test() {
    try {
      this.log('🧪 Testing NLP Pipeline...');

      const testContent = [
        {
          url: 'https://test.com/page1',
          title: 'Test Page 1',
          category: 'test',
          content: 'This is a test page with some content about artificial intelligence and machine learning. It contains information about natural language processing and how it works.',
          metadata: { test: true }
        },
        {
          url: 'https://test.com/page2',
          title: 'Test Page 2',
          category: 'test',
          content: 'Another test page with different content about web development and programming. This page discusses various programming languages and frameworks.',
          metadata: { test: true }
        }
      ];

      const testAgentId = 'test-agent-nlp';
      const testCompanyId = 'test-company-nlp';

      // Test the complete pipeline
      const result = await this.processCrawledContent(
        testAgentId,
        testCompanyId,
        testContent
      );

      // Test search functionality
      const searchResults = await this.searchSimilar(
        testAgentId,
        testCompanyId,
        'artificial intelligence'
      );

      // Clean up test data
      await this.clearKnowledgeBase(testAgentId, testCompanyId);

      return {
        success: true,
        message: 'NLP Pipeline test completed successfully',
        results: {
          processedItems: result.totalItems,
          totalChunks: result.totalChunks,
          totalVectors: result.totalVectors,
          searchResults: searchResults.length,
          processingTime: result.processingTime
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'NLP Pipeline test failed'
      };
    }
  }

  /**
   * Update pipeline configuration
   * @param {Object} newOptions - New configuration options
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // Update services with new configuration
    this.chunkingService.updateConfig({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap
    });

    this.embeddingService.updateConfig({
      provider: this.options.embeddingProvider
    });

    this.log('⚙️ Updated NLP Pipeline configuration', this.options);
  }

  /**
   * Get current pipeline configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return {
      ...this.options,
      chunking: this.chunkingService.getConfig(),
      embedding: this.embeddingService.getConfig()
    };
  }

  /**
   * Logging utility
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  log(message, data = null) {
    if (this.options.enableLogging) {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default NLPPipeline;
