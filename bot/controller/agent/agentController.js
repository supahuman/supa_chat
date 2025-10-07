import Agent from '../../models/agent.js';
import { getGlobalModel } from '../../config/globalModel.js';
import BaseController from '../shared/baseController.js';

/**
 * AgentManagementController - Handles core agent CRUD operations
 * Responsible for creating, reading, updating, and deleting agents
 */
class AgentManagementController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create a new agent for a company
   */
  async createAgent(req, res) {
    try {
      const { companyId, userId } = this.getCompanyContext(req);
      const { name, description, personality, knowledgeBase, trainingExamples } = req.body;
      
      // Validate required fields
      const validation = this.validateRequiredFields(req.body, ['name']);
      if (!validation.isValid) {
        return this.sendValidationError(res, 'Agent name is required', {
          missingFields: validation.missingFields
        });
      }
      
      // Generate unique agent ID
      const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get global model configuration
      const globalModel = getGlobalModel();
      
      // Create agent
      const agent = new Agent({
        agentId,
        companyId,
        createdBy: userId,
        name,
        description: description || 'AI Agent created with Agent Builder',
        personality: personality || 'friendly and helpful',
        knowledgeBase: knowledgeBase || [],
        trainingExamples: trainingExamples || [],
        model: globalModel,
        status: 'active'
      });
      
      await agent.save();
      
      this.logAction('Created agent', { agentId, name, companyId });
      
      // Trigger NLP pipeline for URLs in knowledge base
      if (knowledgeBase && knowledgeBase.length > 0) {
        const urls = knowledgeBase.filter(item => item.url).map(item => item.url);
        if (urls.length > 0) {
          this.logAction('Triggering NLP pipeline', { urls: urls.length });
          try {
            // Note: NLP processing will be handled by AgentKnowledgeController
            // This is just a placeholder for now
            console.log(`🕷️ URLs to process: ${urls.join(', ')}`);
          } catch (error) {
            this.logError('NLP processing', error, { agentId });
            // Don't fail the agent creation if NLP processing fails
          }
        }
      }
      
      return this.sendSuccess(res, agent, 'Agent created successfully', 201);
    } catch (error) {
      this.logError('Create agent', error, { companyId: req.companyId });
      return this.sendError(res, 'Failed to create agent');
    }
  }

  /**
   * Get all agents for a company
   */
  async getAgents(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      
      const agents = await Agent.find({ 
        companyId, 
        status: { $ne: 'deleted' } 
      }).sort({ createdAt: -1 });
      
      this.logAction('Retrieved agents', { count: agents.length, companyId });
      
      return this.sendSuccess(res, agents);
    } catch (error) {
      this.logError('Get agents', error, { companyId: req.companyId });
      return this.sendError(res, 'Failed to get agents');
    }
  }

  /**
   * Get a specific agent
   */
  async getAgent(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      const { agentId } = req.params;
      
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return this.sendNotFound(res, 'Agent');
      }
      
      this.logAction('Retrieved agent', { agentId, companyId });
      
      return this.sendSuccess(res, agent);
    } catch (error) {
      this.logError('Get agent', error, { agentId: req.params.agentId });
      return this.sendError(res, 'Failed to get agent');
    }
  }

  /**
   * Update an existing agent
   */
  async updateAgent(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      const { agentId } = req.params;
      const updateData = req.body;
      
      // Find the agent
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return this.sendNotFound(res, 'Agent');
      }
      
      // Update agent fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'agentId' && key !== 'companyId') {
          agent[key] = updateData[key];
        }
      });
      
      agent.updatedAt = new Date();
      await agent.save();
      
      this.logAction('Updated agent', { agentId, companyId, updatedFields: Object.keys(updateData) });
      
      return this.sendSuccess(res, agent, 'Agent updated successfully');
    } catch (error) {
      this.logError('Update agent', error, { agentId: req.params.agentId });
      return this.sendError(res, 'Failed to update agent');
    }
  }

  /**
   * Delete an agent (soft delete)
   */
  async deleteAgent(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      const { agentId } = req.params;
      
      // Find the agent
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return this.sendNotFound(res, 'Agent');
      }
      
      // Soft delete by updating status
      agent.status = 'deleted';
      agent.deletedAt = new Date();
      await agent.save();
      
      this.logAction('Deleted agent', { agentId, companyId });
      
      return this.sendSuccess(res, null, 'Agent deleted successfully');
    } catch (error) {
      this.logError('Delete agent', error, { agentId: req.params.agentId });
      return this.sendError(res, 'Failed to delete agent');
    }
  }
}

export default new AgentManagementController();
