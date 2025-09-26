import { createClient } from '@supabase/supabase-js';
import VectorDBInterface from './VectorDBInterface.js';

/**
 * Supabase adapter for vector database operations
 * Implements VectorDBInterface for Supabase-specific functionality
 */
class SupabaseAdapter extends VectorDBInterface {
  constructor(config) {
    super();
    this.config = config;
    this.client = null;
  }

  async connect(config = this.config) {
    try {
      this.client = createClient(config.url, config.key);
      
      // Test connection
      const { data, error } = await this.client
        .from('documents')
        .select('count')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // Table doesn't exist is OK
        throw error;
      }
      
      console.log('✅ Supabase connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
      throw error;
    }
  }

  async search(queryVector, limit = 5) {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    try {
      // Supabase vector search using RPC function
      const { data, error } = await this.client.rpc('search_documents', {
        query_embedding: queryVector,
        match_threshold: 0.7,
        match_count: limit
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        results: data.map(r => r.content),
        metadatas: data.map(r => r.metadata),
        distances: data.map(r => 1 - r.similarity)
      };
    } catch (error) {
      console.error('❌ Supabase search failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async addDocuments(documents) {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    try {
      const { data, error } = await this.client
        .from('documents')
        .insert(documents);

      if (error) {
        throw error;
      }

      return { success: true, count: documents.length };
    } catch (error) {
      console.error('❌ Supabase insert failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async deleteDocuments(documentIds) {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    try {
      const { error } = await this.client
        .from('documents')
        .delete()
        .in('id', documentIds);

      if (error) {
        throw error;
      }

      return { success: true, deletedCount: documentIds.length };
    } catch (error) {
      console.error('❌ Supabase delete failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getStats() {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    try {
      const { count, error } = await this.client
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return { success: true, documentCount: count };
    } catch (error) {
      console.error('❌ Supabase stats failed:', error.message);
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
    // Supabase client doesn't need explicit disconnection
    this.client = null;
  }
}

export default SupabaseAdapter;
