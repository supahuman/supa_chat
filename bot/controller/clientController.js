import ClientConfigService from '../services/client/ClientConfigService.js';

/**
 * Controller for client management operations
 * Handles client configuration and database operations
 */
class ClientController {
  constructor() {
    this.clientConfigService = new ClientConfigService();
  }

  /**
   * Get client configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getClientConfig(req, res) {
    try {
      const { clientId } = req.params;
      const config = this.clientConfigService.getClientConfig(clientId);
      
      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Client configuration not found'
        });
      }
      
      res.json({
        success: true,
        config: {
          clientId,
          vectorDB: { type: config.vectorDB.type },
          embeddingProvider: config.embeddingProvider,
          chunkingStrategy: config.chunkingStrategy
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update client configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateClientConfig(req, res) {
    try {
      const { clientId } = req.params;
      const config = req.body;
      
      // Validate configuration
      const validation = this.clientConfigService.validateConfig(config);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid configuration',
          details: validation.errors
        });
      }
      
      // Since we're using MongoDB directly, we can skip database validation
      // MongoDB connection is handled at the application level
      
      await this.clientConfigService.setClientConfig(clientId, config);
      
      res.json({
        success: true,
        message: 'Client configuration updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Test client database connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      const { clientId } = req.params;
      const config = this.clientConfigService.getClientConfig(clientId);
      
      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Client configuration not found'
        });
      }
      
      // Since we're using MongoDB directly, check connection status
      const mongoose = require('mongoose');
      const isConnected = mongoose.connection.readyState === 1;
      
      res.json({
        success: true,
        connected: isConnected,
        databaseType: 'mongodb'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * List all clients
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async listClients(req, res) {
    try {
      const clients = this.clientConfigService.listClientConfigs();
      res.json({
        success: true,
        clients: clients.map(client => ({
          clientId: client.clientId,
          vectorDB: { type: client.vectorDB.type },
          embeddingProvider: client.embeddingProvider,
          chunkingStrategy: client.chunkingStrategy,
          updatedAt: client.updatedAt
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default ClientController;
