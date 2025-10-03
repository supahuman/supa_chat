import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

/**
 * Service for managing client database configurations
 * Handles storage and retrieval of client-specific settings
 */
class ClientConfigService {
  constructor() {
    this.configPath = path.join(process.cwd(), 'data', 'client-configs.json');
    this.configs = new Map();
    this.initialized = false;
    this.loadConfigsSync();
  }

  /**
   * Load client configurations synchronously
   */
  loadConfigsSync() {
    try {
      const data = fsSync.readFileSync(this.configPath, 'utf8');
      const configs = JSON.parse(data);
      
      Object.entries(configs).forEach(([clientId, config]) => {
        this.configs.set(clientId, config);
      });
      
      this.initialized = true;
      console.log(`✅ Loaded ${this.configs.size} client configurations synchronously`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('❌ Error loading client configs:', error.message);
      }
      this.initialized = false;
    }
  }

  /**
   * Initialize client configurations from file
   */
  async initializeConfigs() {
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      
      const data = await fs.readFile(this.configPath, 'utf8');
      const configs = JSON.parse(data);
      
      Object.entries(configs).forEach(([clientId, config]) => {
        this.configs.set(clientId, config);
      });
      
      this.initialized = true;
      console.log(`✅ Loaded ${this.configs.size} client configurations`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('❌ Error loading client configs:', error.message);
      }
      this.initialized = false;
    }
  }

  /**
   * Get client configuration
   * @param {string} clientId - Client identifier
   * @returns {Object|null} Client configuration or null if not found
   */
  getClientConfig(clientId) {
    if (!this.initialized) {
      console.warn('⚠️ ClientConfigService not initialized yet');
      return null;
    }
    const config = this.configs.get(clientId);
    if (!config) return null;
    
    // Add API keys from environment variables or client config
    return {
      ...config,
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
      groqApiKey: config.groqApiKey || process.env.GROQ_API_KEY,
      anthropicApiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      mongodbUri: process.env.MONGODB_URI
    };
  }

  /**
   * Set client configuration
   * @param {string} clientId - Client identifier
   * @param {Object} config - Client configuration
   */
  async setClientConfig(clientId, config) {
    this.configs.set(clientId, {
      ...config,
      updatedAt: new Date().toISOString()
    });
    
    await this.saveConfigs();
    console.log(`✅ Updated configuration for client: ${clientId}`);
  }

  /**
   * Remove client configuration
   * @param {string} clientId - Client identifier
   */
  async removeClientConfig(clientId) {
    const removed = this.configs.delete(clientId);
    if (removed) {
      await this.saveConfigs();
      console.log(`✅ Removed configuration for client: ${clientId}`);
    }
    return removed;
  }

  /**
   * List all client configurations
   * @returns {Array} Array of client configurations
   */
  listClientConfigs() {
    return Array.from(this.configs.entries()).map(([clientId, config]) => ({
      clientId,
      ...config
    }));
  }

  /**
   * Save configurations to file
   */
  async saveConfigs() {
    try {
      const configsObject = Object.fromEntries(this.configs);
      await fs.writeFile(this.configPath, JSON.stringify(configsObject, null, 2));
    } catch (error) {
      console.error('❌ Error saving client configs:', error.message);
      throw error;
    }
  }

  /**
   * Validate client configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validateConfig(config) {
    const errors = [];

    if (!config.vectorDB) {
      errors.push('vectorDB configuration is required');
    } else {
      if (!config.vectorDB.type) {
        errors.push('vectorDB.type is required');
      }
      if (!config.vectorDB.connectionString && !config.vectorDB.url) {
        errors.push('vectorDB connection details are required');
      }
    }

    if (!config.embeddingProvider) {
      errors.push('embeddingProvider is required');
    }

    if (!config.chunkingStrategy) {
      errors.push('chunkingStrategy is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default ClientConfigService;
