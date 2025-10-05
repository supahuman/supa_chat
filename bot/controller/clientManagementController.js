import ClientConfigService from '../services/client/ClientConfigService.js';
import DatabaseFactory from '../services/database/DatabaseFactory.js';
import LLMFactory from '../services/llm/LLMFactory.js';

/**
 * Controller for client management operations
 * Handles client creation, updates, and validation
 */
class ClientManagementController {
  constructor() {
    this.clientConfigService = new ClientConfigService();
    
    // Bind methods to preserve 'this' context
    this.createClient = this.createClient.bind(this);
    this.getClient = this.getClient.bind(this);
    this.listClients = this.listClients.bind(this);
    this.updateClient = this.updateClient.bind(this);
    this.deleteClient = this.deleteClient.bind(this);
    this.testDatabaseConnection = this.testDatabaseConnection.bind(this);
    this.testLLMConnection = this.testLLMConnection.bind(this);
  }

  /**
   * Create a new client configuration
   * POST /api/client
   */
  async createClient(req, res) {
    try {
      const { clientId, config } = req.body;

      if (!clientId || !config) {
        return res.status(400).json({
          success: false,
          error: 'Client ID and configuration are required'
        });
      }

      // Check if client already exists
      const existingConfig = this.clientConfigService.getClientConfig(clientId);
      if (existingConfig) {
        return res.status(409).json({
          success: false,
          error: 'Client already exists'
        });
      }

      // Validate configuration
      const validation = this.validateClientConfig(config);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid configuration',
          details: validation.errors
        });
      }

      // Test database connection
      const dbTest = await this.testDatabaseConnection(config.vectorDB);
      if (!dbTest.success) {
        return res.status(400).json({
          success: false,
          error: 'Database connection failed',
          details: dbTest.error
        });
      }

      // Test LLM connection
      const llmTest = await this.testLLMConnection(config.llm, config);
      if (!llmTest.success) {
        return res.status(400).json({
          success: false,
          error: 'LLM connection failed',
          details: llmTest.error
        });
      }

      // Save client configuration
      await this.clientConfigService.setClientConfig(clientId, config);

      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        clientId,
        config: {
          name: config.name,
          vectorDB: { type: config.vectorDB.type },
          llm: { provider: config.llm.provider, model: config.llm.model }
        }
      });

    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  /**
   * Get client configuration
   * GET /api/client/:clientId
   */
  async getClient(req, res) {
    try {
      const { clientId } = req.params;
      const config = this.clientConfigService.getClientConfig(clientId);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      // Return config without sensitive data
      const safeConfig = {
        clientId,
        name: config.name,
        description: config.description,
        vectorDB: {
          type: config.vectorDB.type,
          database: config.vectorDB.database,
          collection: config.vectorDB.collection
        },
        llm: {
          provider: config.llm.provider,
          model: config.llm.model,
          temperature: config.llm.temperature,
          maxTokens: config.llm.maxTokens
        },
        chunking: config.chunking,
        webCrawler: config.webCrawler
      };

      res.json({
        success: true,
        client: safeConfig
      });

    } catch (error) {
      console.error('Error getting client:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * List all clients
   * GET /api/client
   */
  async listClients(req, res) {
    try {
      const clients = this.clientConfigService.listClientConfigs();
      
      const safeClients = clients.map(client => ({
        clientId: client.clientId,
        name: client.name,
        description: client.description,
        vectorDB: { type: client.vectorDB.type },
        llm: { provider: 'global', model: 'managed' }, // Using global model now
        status: 'active'
      }));

      res.json({
        success: true,
        clients: safeClients
      });

    } catch (error) {
      console.error('Error listing clients:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update client configuration
   * PUT /api/client/:clientId
   */
  async updateClient(req, res) {
    try {
      const { clientId } = req.params;
      const { config } = req.body;

      const existingConfig = this.clientConfigService.getClientConfig(clientId);
      if (!existingConfig) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      // Validate configuration
      const validation = this.validateClientConfig(config);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid configuration',
          details: validation.errors
        });
      }

      // Test connections if they changed
      if (config.vectorDB && JSON.stringify(config.vectorDB) !== JSON.stringify(existingConfig.vectorDB)) {
        const dbTest = await this.testDatabaseConnection(config.vectorDB);
        if (!dbTest.success) {
          return res.status(400).json({
            success: false,
            error: 'Database connection failed',
            details: dbTest.error
          });
        }
      }

      if (config.llm && JSON.stringify(config.llm) !== JSON.stringify(existingConfig.llm)) {
        const llmTest = await this.testLLMConnection(config.llm, config);
        if (!llmTest.success) {
          return res.status(400).json({
            success: false,
            error: 'LLM connection failed',
            details: llmTest.error
          });
        }
      }

      // Update configuration
      await this.clientConfigService.setClientConfig(clientId, config);

      res.json({
        success: true,
        message: 'Client updated successfully',
        clientId
      });

    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete client configuration
   * DELETE /api/client/:clientId
   */
  async deleteClient(req, res) {
    try {
      const { clientId } = req.params;

      const removed = await this.clientConfigService.removeClientConfig(clientId);
      if (!removed) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      res.json({
        success: true,
        message: 'Client deleted successfully',
        clientId
      });

    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Test client database connection
   * POST /api/client/:clientId/test-database
   */
  async testDatabaseConnection(req, res) {
    try {
      const { clientId } = req.params;
      const config = this.clientConfigService.getClientConfig(clientId);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      const result = await this.testDatabaseConnection(config.vectorDB);
      res.json(result);

    } catch (error) {
      console.error('Error testing database connection:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Test client LLM connection
   * POST /api/client/:clientId/test-llm
   */
  async testLLMConnection(req, res) {
    try {
      const { clientId } = req.params;
      const config = this.clientConfigService.getClientConfig(clientId);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      const result = await this.testLLMConnection(config.llm, config);
      res.json(result);

    } catch (error) {
      console.error('Error testing LLM connection:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Validate client configuration
   * @param {Object} config - Client configuration
   * @returns {Object} Validation result
   */
  validateClientConfig(config) {
    const errors = [];

    if (!config.name) {
      errors.push('Client name is required');
    }

    if (!config.vectorDB) {
      errors.push('Vector database configuration is required');
    } else {
      if (!config.vectorDB.type) {
        errors.push('Vector database type is required');
      }
      if (!config.vectorDB.connectionString && !config.vectorDB.url) {
        errors.push('Vector database connection details are required');
      }
    }

    if (!config.llm) {
      errors.push('LLM configuration is required');
    } else {
      if (!config.llm.provider) {
        errors.push('LLM provider is required');
      }
      if (!config.llm.model) {
        errors.push('LLM model is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Test database connection
   * @param {Object} vectorDBConfig - Vector database configuration
   * @returns {Object} Test result
   */
  async testDatabaseConnection(vectorDBConfig) {
    try {
      const vectorDB = DatabaseFactory.create(vectorDBConfig.type, vectorDBConfig);
      await vectorDB.connect();
      await vectorDB.disconnect();
      
      return {
        success: true,
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test LLM connection
   * @param {Object} llmConfig - LLM configuration
   * @param {Object} fullConfig - Full client configuration
   * @returns {Object} Test result
   */
  async testLLMConnection(llmConfig, fullConfig) {
    try {
      const llm = LLMFactory.create(llmConfig.provider, {
        apiKey: fullConfig[`${llmConfig.provider}ApiKey`],
        model: llmConfig.model,
        ...llmConfig
      });

      await llm.initialize();
      const testResult = await llm.testConnection();
      
      return {
        success: testResult,
        message: testResult ? 'LLM connection successful' : 'LLM connection failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new ClientManagementController();
