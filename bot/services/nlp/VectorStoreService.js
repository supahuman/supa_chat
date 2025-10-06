import AgentVector from '../../models/AgentVector.js';

/**
 * VectorStoreService - Handles vector storage and retrieval using MongoDB
 * Provides semantic search capabilities for agent knowledge bases
 */
class VectorStoreService {
  constructor(options = {}) {
    this.options = {
      // Search configuration
      defaultLimit: options.defaultLimit || 10,
      similarityThreshold: options.similarityThreshold || 0.7,
      
      ...options
    };

    // Use the AgentVector model
    this.VectorModel = AgentVector;
  }


  /**
   * Store vectors for an agent
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Array} documents - Array of documents with embeddings
   * @param {Object} options - Additional options
   * @returns {Object} Storage results
   */
  async storeVectors(agentId, companyId, documents, options = {}) {
    try {
      if (!agentId || !companyId) {
        throw new Error('Agent ID and Company ID are required');
      }

      if (!Array.isArray(documents) || documents.length === 0) {
        throw new Error('Documents array is required and must not be empty');
      }

      console.log(`💾 Storing ${documents.length} vectors for agent ${agentId}`);

      // Prepare vectors for storage
      const vectors = documents.map((doc, index) => ({
        agentId,
        companyId,
        content: doc.pageContent || doc.content,
        embedding: doc.embedding,
        metadata: {
          ...doc.metadata,
          storedAt: new Date().toISOString(),
          documentIndex: index
        },
        source: {
          type: doc.metadata?.type || 'text',
          url: doc.metadata?.url,
          title: doc.metadata?.title,
          category: doc.metadata?.category,
          chunkIndex: doc.metadata?.chunkIndex,
          totalChunks: doc.metadata?.totalChunks,
          originalLength: doc.metadata?.originalLength
        }
      }));

      // Store vectors using MongoDB adapter
      const result = await this.vectorAdapter.storeVectors(vectors);

      console.log(`✅ Successfully stored ${result.storedCount} vectors for agent ${agentId}`);
      
      return {
        success: true,
        storedCount: result.storedCount,
        agentId,
        companyId,
        message: `Stored ${result.storedCount} vectors successfully`
      };

    } catch (error) {
      console.error('❌ Error storing vectors:', error.message);
      throw error;
    }
  }

  /**
   * Search for similar vectors using cosine similarity
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Array} queryEmbedding - Query embedding vector
   * @param {Object} options - Search options
   * @returns {Array} Array of similar vectors with scores
   */
  async searchSimilar(agentId, companyId, queryEmbedding, options = {}) {
    try {
      if (!agentId || !companyId || !queryEmbedding) {
        throw new Error('Agent ID, Company ID, and query embedding are required');
      }

      const {
        limit = this.options.defaultLimit,
        threshold = this.options.similarityThreshold,
        sourceType = null,
        category = null
      } = options;

      console.log(`🔍 Searching for similar vectors (limit: ${limit}, threshold: ${threshold})`);

      // Build query filter
      const filter = { agentId, companyId };
      if (sourceType) filter['source.type'] = sourceType;
      if (category) filter['source.category'] = category;

      // Get all vectors for the agent (MongoDB doesn't have native vector similarity search)
      const vectors = await this.VectorModel.find(filter).lean();

      if (vectors.length === 0) {
        console.log('No vectors found for agent');
        return [];
      }

      // Calculate cosine similarity for each vector
      const similarities = vectors.map(vector => {
        const similarity = this.calculateCosineSimilarity(queryEmbedding, vector.embedding);
        return {
          ...vector,
          similarity,
          score: similarity
        };
      });

      // Filter by threshold and sort by similarity
      const filteredResults = similarities
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      console.log(`✅ Found ${filteredResults.length} similar vectors`);
      return filteredResults;

    } catch (error) {
      console.error('❌ Error searching similar vectors:', error.message);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array} vector1 - First vector
   * @param {Array} vector2 - Second vector
   * @returns {number} Cosine similarity score
   */
  calculateCosineSimilarity(vector1, vector2) {
    return this.VectorModel.calculateCosineSimilarity(vector1, vector2);
  }

  /**
   * Get vectors for an agent
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Object} options - Query options
   * @returns {Array} Array of vectors
   */
  async getVectors(agentId, companyId, options = {}) {
    try {
      const {
        limit = 100,
        sourceType = null,
        category = null,
        skip = 0
      } = options;

      const filter = { agentId, companyId };
      if (sourceType) filter['source.type'] = sourceType;
      if (category) filter['source.category'] = category;

      const vectors = await this.VectorModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return vectors;

    } catch (error) {
      console.error('❌ Error getting vectors:', error.message);
      throw error;
    }
  }

  /**
   * Delete vectors for an agent
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Object} options - Delete options
   * @returns {Object} Delete results
   */
  async deleteVectors(agentId, companyId, options = {}) {
    try {
      const { sourceType = null, category = null } = options;

      const filter = { agentId, companyId };
      if (sourceType) filter['source.type'] = sourceType;
      if (category) filter['source.category'] = category;

      const result = await this.VectorModel.deleteMany(filter);

      console.log(`🗑️ Deleted ${result.deletedCount} vectors for agent ${agentId}`);
      
      return {
        success: true,
        deletedCount: result.deletedCount,
        agentId,
        companyId
      };

    } catch (error) {
      console.error('❌ Error deleting vectors:', error.message);
      throw error;
    }
  }

  /**
   * Get vector statistics for an agent
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @returns {Object} Vector statistics
   */
  async getVectorStats(agentId, companyId) {
    try {
      const stats = await this.VectorModel.getVectorStats(agentId, companyId);
      const result = stats[0] || {
        totalVectors: 0,
        totalContentLength: 0,
        avgContentLength: 0,
        sourceTypes: [],
        categories: [],
        embeddingDimension: 0,
        oldestVector: null,
        newestVector: null
      };

      return {
        agentId,
        companyId,
        ...result,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error getting vector stats:', error.message);
      throw error;
    }
  }

  /**
   * Create indexes for optimal performance
   * @returns {Object} Index creation results
   */
  async createIndexes() {
    try {
      console.log('🔧 Creating vector store indexes...');

      // Indexes are automatically created by Mongoose based on the schema
      // We can trigger index creation by calling ensureIndexes
      await this.VectorModel.ensureIndexes();

      console.log('✅ Vector store indexes created successfully');
      
      return {
        success: true,
        message: 'Indexes created successfully'
      };

    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
      throw error;
    }
  }

  /**
   * Test vector store functionality
   * @returns {Object} Test results
   */
  async test() {
    try {
      const testAgentId = 'test-agent';
      const testCompanyId = 'test-company';
      const testEmbedding = new Array(1536).fill(0.1); // Mock embedding

      // Test storing vectors
      const testDocs = [{
        pageContent: 'Test content',
        embedding: testEmbedding,
        metadata: { type: 'text', test: true }
      }];

      await this.storeVectors(testAgentId, testCompanyId, testDocs);
      
      // Test searching
      const results = await this.searchSimilar(testAgentId, testCompanyId, testEmbedding);
      
      // Clean up test data
      await this.deleteVectors(testAgentId, testCompanyId);

      return {
        success: true,
        message: 'Vector store test completed successfully',
        testResults: {
          stored: testDocs.length,
          found: results.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Vector store test failed'
      };
    }
  }
}

export default VectorStoreService;
