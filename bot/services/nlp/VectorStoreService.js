import AgentVector from '../../models/agentVectorModel.js';

/**
 * VectorStoreService - Handles vector storage and retrieval using MongoDB
 * Provides semantic search capabilities for agent knowledge bases
 */
class VectorStoreService {
  constructor(options = {}) {
    this.options = {
      // Search configuration
      defaultLimit: options.defaultLimit || 10,
      similarityThreshold: options.similarityThreshold || 0.3, // Lowered from 0.7 to 0.3
      
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

      // Store vectors directly using AgentVector model
      const result = await this.VectorModel.insertMany(vectors);

      console.log(`✅ Successfully stored ${result.length} vectors for agent ${agentId}`);
      
      return {
        success: true,
        storedCount: result.length,
        agentId,
        companyId,
        message: `Stored ${result.length} vectors successfully`
      };

    } catch (error) {
      console.error('❌ Error storing vectors:', error.message);
      throw error;
    }
  }

  /**
   * Search for similar content using text query (generates embeddings automatically)
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {string} queryText - Text query to search for
   * @param {Object} options - Search options
   * @returns {Array} Array of similar vectors with scores
   */
  async searchSimilarContent(agentId, companyId, queryText, options = {}) {
    try {
      if (!agentId || !companyId || !queryText) {
        throw new Error('Agent ID, Company ID, and query text are required');
      }

      console.log(`🔍 Searching for similar content: "${queryText}"`);

             // Generate embedding for the query text
             const EmbeddingService = (await import('./EmbeddingService.js')).default;
             const embeddingService = new EmbeddingService();
             
             const queryEmbedding = await embeddingService.generateEmbedding(queryText);
      
      if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
        throw new Error('Failed to generate query embedding');
      }

      // Use the existing searchSimilar method with the generated embedding
      return await this.searchSimilar(agentId, companyId, queryEmbedding, options);

    } catch (error) {
      console.error('❌ Error searching similar content:', error.message);
      throw error;
    }
  }

  /**
   * Search for similar vectors using MongoDB Atlas Vector Search
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

      console.log(`🔍 Searching for similar vectors using Atlas Vector Search (limit: ${limit})`);

      // Build aggregation pipeline for Atlas Vector Search
      const pipeline = [
        {
          $vectorSearch: {
            index: "vector_index", // Atlas Vector Search index name
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: limit * 10, // Get more candidates for filtering
            limit: limit
          }
        },
        {
          $match: {
            agentId: agentId,
            companyId: companyId,
            ...(sourceType && { 'source.type': sourceType }),
            ...(category && { 'source.category': category })
          }
        },
        {
          $addFields: {
            similarity: { $meta: "vectorSearchScore" },
            score: { $meta: "vectorSearchScore" }
          }
        },
        {
          $match: {
            similarity: { $gte: threshold }
          }
        },
        {
          $limit: limit
        }
      ];

      // Execute Atlas Vector Search
      const results = await this.VectorModel.aggregate(pipeline);

      console.log(`✅ Found ${results.length} similar vectors using Atlas Vector Search`);
      
      // If Atlas Vector Search returns no results, fall back to manual search
      if (results.length === 0) {
        console.log('🔄 Atlas Vector Search returned 0 results, falling back to manual cosine similarity...');
        return await this.searchSimilarFallback(agentId, companyId, queryEmbedding, options);
      }
      
      return results;

    } catch (error) {
      console.error('❌ Error searching similar vectors with Atlas Vector Search:', error.message);
      
      // Fallback to manual cosine similarity if Atlas Vector Search fails
      console.log('🔄 Falling back to manual cosine similarity search...');
      return await this.searchSimilarFallback(agentId, companyId, queryEmbedding, options);
    }
  }

  /**
   * Fallback search using manual cosine similarity
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Array} queryEmbedding - Query embedding vector
   * @param {Object} options - Search options
   * @returns {Array} Array of similar vectors with scores
   */
  async searchSimilarFallback(agentId, companyId, queryEmbedding, options = {}) {
    try {
      const {
        limit = this.options.defaultLimit,
        threshold = options.threshold || 0.3, // Use the original threshold, don't force it to 0.3
        sourceType = null,
        category = null
      } = options;

      console.log(`🔍 Fallback: Searching for similar vectors (limit: ${limit}, threshold: ${threshold})`);

      // Build query filter
      const filter = { agentId, companyId };
      if (sourceType) filter['source.type'] = sourceType;
      if (category) filter['source.category'] = category;

      // Get all vectors for the agent
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

      // Sort by similarity (highest first) and get top results
      const sortedResults = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      // Filter by threshold after sorting
      const filteredResults = sortedResults.filter(item => item.similarity >= threshold);

      // Log similarity scores for debugging
      if (sortedResults.length > 0) {
        console.log(`📊 Top similarity scores: ${sortedResults.slice(0, 3).map(r => r.similarity.toFixed(4)).join(', ')}`);
      }

      console.log(`✅ Found ${filteredResults.length} similar vectors (fallback)`);
      return filteredResults;

    } catch (error) {
      console.error('❌ Error in fallback search:', error.message);
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
