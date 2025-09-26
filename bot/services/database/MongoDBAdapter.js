import mongoose from 'mongoose';
import VectorDBInterface from './VectorDBInterface.js';

/**
 * MongoDB Atlas adapter for vector database operations
 * Implements VectorDBInterface for MongoDB-specific functionality
 */
class MongoDBAdapter extends VectorDBInterface {
  constructor(config) {
    super();
    this.config = config;
    this.connection = null;
    this.collection = null;
  }

  async connect(config = this.config) {
    try {
      this.connection = await mongoose.connect(config.connectionString);
      this.collection = this.connection.connection.db.collection('knowledgebases');
      console.log('✅ MongoDB connected successfully');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async search(queryVector, limit = 5) {
    if (!this.collection) {
      throw new Error('Database not connected');
    }

    try {
      const results = await this.collection.aggregate([
        {
          $vectorSearch: {
            index: this.config.vectorIndex || 'vector_index',
            path: 'embedding',
            queryVector,
            numCandidates: limit * 4,
            limit
          }
        },
        {
          $project: {
            content: 1,
            metadata: 1,
            title: 1,
            category: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]).toArray();

      return {
        success: true,
        results: results.map(r => r.content),
        metadatas: results.map(r => r.metadata),
        distances: results.map(r => 1 - (r.score || 0))
      };
    } catch (error) {
      console.error('❌ MongoDB search failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async addDocuments(documents) {
    if (!this.collection) {
      throw new Error('Database not connected');
    }

    try {
      const result = await this.collection.insertMany(documents);
      return { success: true, count: result.insertedCount };
    } catch (error) {
      console.error('❌ MongoDB insert failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async deleteDocuments(documentIds) {
    if (!this.collection) {
      throw new Error('Database not connected');
    }

    try {
      const result = await this.collection.deleteMany({ _id: { $in: documentIds } });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('❌ MongoDB delete failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getStats() {
    if (!this.collection) {
      throw new Error('Database not connected');
    }

    try {
      const count = await this.collection.countDocuments();
      return { success: true, documentCount: count };
    } catch (error) {
      console.error('❌ MongoDB stats failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    try {
      await this.connect();
      return true;
    } catch (error) {
      return false;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      this.collection = null;
    }
  }
}

export default MongoDBAdapter;
