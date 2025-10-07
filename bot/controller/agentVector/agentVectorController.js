import AgentVector from '../../models/agentVectorModel.js';
import BaseController from '../shared/baseController.js';

/**
 * AgentVectorController - Handles vector embedding operations
 * Modular controller under 150 lines
 */
class AgentVectorController extends BaseController {
  constructor() {
    super();
    this.logAction('AgentVectorController initialized');
  }

  /**
   * Create new vector embedding
   */
  async createVector(req, res) {
    try {
      const { agentId, companyId, content, embedding, metadata, source } = req.body;

      const validation = this.validateRequiredFields(req.body, ['agentId', 'companyId', 'content', 'embedding', 'source']);
      if (!validation.isValid) {
        return this.sendValidationError(res, 'Missing required fields', validation.missingFields);
      }

      const vector = new AgentVector({
        agentId,
        companyId,
        content,
        embedding,
        metadata: metadata || {},
        source
      });

      await vector.save();
      this.logAction('Vector created', { agentId, sourceType: source.type });
      
      return this.sendSuccess(res, vector, 'Vector created successfully', 201);
    } catch (error) {
      this.logError('createVector', error, { body: req.body });
      return this.sendError(res, 'Failed to create vector', 500);
    }
  }

  /**
   * Get vectors for agent
   */
  async getVectors(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = this.getCompanyContext(req);
      const { sourceType, limit = 100, offset = 0 } = req.query;

      const filter = { agentId, companyId };
      if (sourceType) filter['source.type'] = sourceType;

      const vectors = await AgentVector.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      const total = await AgentVector.countDocuments(filter);

      return this.sendSuccess(res, {
        vectors,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + vectors.length) < total
        }
      });
    } catch (error) {
      this.logError('getVectors', error, { agentId: req.params.agentId });
      return this.sendError(res, 'Failed to get vectors', 500);
    }
  }

  /**
   * Get vector statistics
   */
  async getVectorStats(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = this.getCompanyContext(req);

      const stats = await AgentVector.getVectorStats(agentId, companyId);
      
      return this.sendSuccess(res, stats[0] || {
        totalVectors: 0,
        totalContentLength: 0,
        avgContentLength: 0,
        sourceTypes: [],
        categories: [],
        embeddingDimension: 0
      });
    } catch (error) {
      this.logError('getVectorStats', error, { agentId: req.params.agentId });
      return this.sendError(res, 'Failed to get vector stats', 500);
    }
  }

  /**
   * Search vectors by similarity
   */
  async searchVectors(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = this.getCompanyContext(req);
      const { queryEmbedding, limit = 10, threshold = 0.7 } = req.body;

      if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
        return this.sendValidationError(res, 'Query embedding is required and must be an array');
      }

      const vectors = await AgentVector.find({ agentId, companyId });
      
      // Calculate similarity scores
      const results = vectors.map(vector => ({
        ...vector.toObject(),
        similarity: vector.getSimilarity(queryEmbedding)
      }))
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, parseInt(limit));

      return this.sendSuccess(res, results);
    } catch (error) {
      this.logError('searchVectors', error, { agentId: req.params.agentId });
      return this.sendError(res, 'Failed to search vectors', 500);
    }
  }

  /**
   * Delete vector by ID
   */
  async deleteVector(req, res) {
    try {
      const { vectorId } = req.params;
      const { companyId } = this.getCompanyContext(req);

      const vector = await AgentVector.findOneAndDelete({ _id: vectorId, companyId });
      if (!vector) {
        return this.sendNotFound(res, 'Vector');
      }

      this.logAction('Vector deleted', { vectorId, agentId: vector.agentId });
      return this.sendSuccess(res, null, 'Vector deleted successfully');
    } catch (error) {
      this.logError('deleteVector', error, { vectorId: req.params.vectorId });
      return this.sendError(res, 'Failed to delete vector', 500);
    }
  }

  /**
   * Delete all vectors for agent
   */
  async deleteAgentVectors(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = this.getCompanyContext(req);

      const result = await AgentVector.deleteMany({ agentId, companyId });
      
      this.logAction('Agent vectors deleted', { agentId, deletedCount: result.deletedCount });
      return this.sendSuccess(res, { deletedCount: result.deletedCount }, 'Agent vectors deleted successfully');
    } catch (error) {
      this.logError('deleteAgentVectors', error, { agentId: req.params.agentId });
      return this.sendError(res, 'Failed to delete agent vectors', 500);
    }
  }
}

export default new AgentVectorController();
