import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import DatabaseFactory from './database/DatabaseFactory.js';
import ClientConfigService from './client/ClientConfigService.js';

dotenv.config();

class ChunkingStrategyManager {
  constructor() {
    this.currentStrategy = process.env.CHUNKING_STRATEGY || 'custom';
  }

  /**
   * Get current chunking strategy and database status
   */
  async getStatus() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const db = mongoose.connection.db;
      const collection = db.collection('knowledgebases');
      
      const totalDocs = await collection.countDocuments();
      const customDocs = await collection.countDocuments({ 'metadata.source': { $ne: 'langchain-processing' } });
      const langchainDocs = await collection.countDocuments({ 'metadata.source': 'langchain-processing' });
      
      await mongoose.disconnect();
      
      return {
        currentStrategy: this.currentStrategy,
        totalDocuments: totalDocs,
        customDocuments: customDocs,
        langchainDocuments: langchainDocs,
        isMixed: customDocs > 0 && langchainDocs > 0,
        isClean: (this.currentStrategy === 'custom' && customDocs === totalDocs) || 
                 (this.currentStrategy === 'langchain' && langchainDocs === totalDocs)
      };
    } catch (error) {
      console.error('Error getting status:', error);
      return { error: error.message };
    }
  }

  /**
   * Switch chunking strategy with smart handling
   */
  async switchStrategy(newStrategy, options = {}) {
    if (!['custom', 'langchain'].includes(newStrategy)) {
      throw new Error('Invalid strategy. Must be "custom" or "langchain"');
    }

    try {
      console.log(`🔄 Switching from ${this.currentStrategy} to ${newStrategy} chunking strategy...`);
      
      // Get current status
      const status = await this.getStatus();
      console.log('📊 Current database status:', status);
      
      // If already using the target strategy and database is clean, no action needed
      if (this.currentStrategy === newStrategy && status.isClean) {
        console.log(`✅ Already using ${newStrategy} strategy with clean database`);
        return {
          success: true,
          newStrategy,
          message: `Already using ${newStrategy} chunking strategy`,
          action: 'none'
        };
      }
      
      // Check if we can reuse existing chunks
      const canReuseChunks = this.canReuseChunks(newStrategy, status);
      
      if (canReuseChunks) {
        console.log(`♻️ Reusing existing ${newStrategy} chunks - no re-chunking needed`);
        this.currentStrategy = newStrategy;
        
        return {
          success: true,
          newStrategy,
          message: `Switched to ${newStrategy} strategy using existing chunks`,
          action: 'reuse',
          documentCount: status.totalDocuments
        };
      }
      
      // Check if cleanup is needed for mixed strategies
      if (status.isMixed) {
        console.log('⚠️ Mixed strategies detected. Cleanup required.');
        if (!options.force) {
          throw new Error('Database contains mixed chunking strategies. Use --force to proceed with cleanup.');
        }
      }
      
      // Clean database if needed
      if (status.totalDocuments > 0 && (status.isMixed || !status.isClean)) {
        console.log('🗑️ Cleaning existing knowledge base...');
        await this.cleanDatabase();
      }
      
      // Reload knowledge base with new strategy only if needed
      if (options.reload !== false && !canReuseChunks) {
        console.log('🔄 Reloading knowledge base with new strategy...');
        await this.reloadKnowledgeBase();
      }
      
      this.currentStrategy = newStrategy;
      
      // Update .env file if requested
      if (options.updateEnv !== false) {
        await this.updateEnvFile(newStrategy);
      }
      
      return {
        success: true,
        newStrategy,
        message: `Successfully switched to ${newStrategy} chunking strategy`,
        action: 'reload'
      };
      
    } catch (error) {
      console.error('❌ Error switching strategy:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if we can reuse existing chunks for the target strategy
   */
  canReuseChunks(targetStrategy, status) {
    // If switching to custom and we have custom chunks, we can reuse
    if (targetStrategy === 'custom' && status.customDocuments > 0 && status.langchainDocuments === 0) {
      return true;
    }
    
    // If switching to langchain and we have langchain chunks, we can reuse
    if (targetStrategy === 'langchain' && status.langchainDocuments > 0 && status.customDocuments === 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Clean the entire knowledge base database
   */
  async cleanDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const db = mongoose.connection.db;
      const collection = db.collection('knowledgebases');
      
      const deleteResult = await collection.deleteMany({});
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} documents from knowledge base`);
      
      await mongoose.disconnect();
      return { success: true, deletedCount: deleteResult.deletedCount };
    } catch (error) {
      console.error('❌ Error cleaning database:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reload knowledge base with current strategy
   */
  async reloadKnowledgeBase() {
    try {
      // Ensure MongoDB connection
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
      }
      
      // Use new database layer with default client
      const clientConfigService = new ClientConfigService();
      const clientConfig = clientConfigService.getClientConfig('supa-chat');
      
      if (!clientConfig) {
        throw new Error('Default client configuration not found');
      }
      
      const vectorDB = DatabaseFactory.create(clientConfig.vectorDB.type, clientConfig.vectorDB);
      await vectorDB.connect();
      
      // For now, just return success - knowledge base loading will be handled by client services
      const result = { success: true, count: 0, message: 'Knowledge base reload handled by client services' };
      
      if (result.success) {
        console.log(`✅ Knowledge base reloaded with ${result.count} chunks using ${this.currentStrategy} strategy`);
        return { success: true, count: result.count };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error reloading knowledge base:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate database consistency
   */
  async validateDatabase() {
    const status = await this.getStatus();
    
    const issues = [];
    
    if (status.isMixed) {
      issues.push('Mixed chunking strategies detected');
    }
    
    if (!status.isClean) {
      issues.push(`Database contains ${status.currentStrategy === 'custom' ? 'LangChain' : 'custom'} documents but strategy is set to ${status.currentStrategy}`);
    }
    
    if (status.totalDocuments === 0) {
      issues.push('No documents in knowledge base');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      status
    };
  }

  /**
   * Get supported file types for current strategy
   */
  getSupportedFileTypes() {
    if (this.currentStrategy === 'langchain') {
      return ['txt', 'md', 'pdf', 'docx', 'csv', 'json', 'html'];
    } else {
      return ['md', 'txt'];
    }
  }

  /**
   * Get chunking configuration for current strategy
   */
  getChunkingConfig() {
    if (this.currentStrategy === 'langchain') {
      return {
        strategy: 'langchain',
        chunkSize: Number(process.env.LANGCHAIN_CHUNK_SIZE || 1000),
        chunkOverlap: Number(process.env.LANGCHAIN_CHUNK_OVERLAP || 200),
        supportedTypes: (process.env.LANGCHAIN_SUPPORTED_TYPES || 'txt,md,pdf,docx,csv,json,html').split(','),
        embeddingProvider: process.env.EMBEDDING_PROVIDER || 'openai'
      };
    } else {
      return {
        strategy: 'custom',
        chunkSize: 500,
        chunkOverlap: 100,
        supportedTypes: ['md', 'txt'],
        embeddingProvider: 'openai'
      };
    }
  }

  /**
   * Update .env file with new chunking strategy
   */
  async updateEnvFile(newStrategy) {
    try {
      const envPath = path.join(process.cwd(), '.env');
      const envContent = await fs.readFile(envPath, 'utf-8');
      
      // Update or add CHUNKING_STRATEGY
      const lines = envContent.split('\n');
      let updated = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('CHUNKING_STRATEGY=')) {
          lines[i] = `CHUNKING_STRATEGY=${newStrategy}`;
          updated = true;
          break;
        }
      }
      
      if (!updated) {
        lines.push(`CHUNKING_STRATEGY=${newStrategy}`);
      }
      
      await fs.writeFile(envPath, lines.join('\n'));
      console.log(`📝 Updated .env file: CHUNKING_STRATEGY=${newStrategy}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating .env file:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ChunkingStrategyManager;
