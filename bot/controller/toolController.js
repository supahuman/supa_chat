import Agent from '../models/Agent.js';
import ToolExecutionService from '../services/tools/ToolExecutionService.js';

/**
 * Controller for agent tool management
 * Handles tool configuration and execution
 */
class ToolController {
  constructor() {
    this.toolExecutionService = new ToolExecutionService();
  }

  /**
   * Get agent tools configuration
   * GET /api/company/agents/:agentId/tools
   */
  async getAgentTools(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req.company;

      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      const availableTools = this.toolExecutionService.getAvailableTools(agent.tools?.enabled || []);

      res.json({
        success: true,
        data: {
          enabled: agent.tools?.enabled || [],
          configurations: agent.tools?.configurations || {},
          permissions: agent.tools?.permissions || {},
          availableTools
        }
      });

    } catch (error) {
      console.error('❌ Error getting agent tools:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agent tools'
      });
    }
  }

  /**
   * Update agent tools configuration
   * PUT /api/company/agents/:agentId/tools
   */
  async updateAgentTools(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req.company;
      const { enabled, configurations, permissions } = req.body;

      // Validate enabled tools
      const validTools = ['onedrive', 'slack', 'email', 'ticket', 'callback', 'docs', 'update', 'refund', 'escalate', 'survey'];
      const invalidTools = enabled?.filter(tool => !validTools.includes(tool));
      
      if (invalidTools?.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid tools: ${invalidTools.join(', ')}`
        });
      }

      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      // Update agent tools
      agent.tools = {
        enabled: enabled || [],
        configurations: configurations || new Map(),
        permissions: permissions || new Map()
      };

      await agent.save();

      const availableTools = this.toolExecutionService.getAvailableTools(agent.tools.enabled);

      res.json({
        success: true,
        message: 'Agent tools updated successfully',
        data: {
          enabled: agent.tools.enabled,
          configurations: agent.tools.configurations,
          permissions: agent.tools.permissions,
          availableTools
        }
      });

    } catch (error) {
      console.error('❌ Error updating agent tools:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update agent tools'
      });
    }
  }

  /**
   * Execute a tool
   * POST /api/company/agents/:agentId/tools/execute
   */
  async executeTool(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req.company;
      const { toolId, parameters } = req.body;

      if (!toolId || !parameters) {
        return res.status(400).json({
          success: false,
          error: 'Tool ID and parameters are required'
        });
      }

      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      // Check if tool is enabled for this agent
      if (!agent.tools?.enabled?.includes(toolId)) {
        return res.status(403).json({
          success: false,
          error: `Tool '${toolId}' is not enabled for this agent`
        });
      }

      // Execute the tool
      const context = {
        agentId,
        companyId,
        userId: req.user?.userId,
        agent: agent
      };

      const result = await this.toolExecutionService.executeTool(toolId, parameters, context);

      res.json({
        success: result.success,
        data: result,
        toolId
      });

    } catch (error) {
      console.error('❌ Error executing tool:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute tool'
      });
    }
  }

  /**
   * Get available tools
   * GET /api/tools/available
   */
  async getAvailableTools(req, res) {
    try {
      const allTools = [
        'onedrive', 'slack', 'email', 'ticket', 'callback', 
        'docs', 'update', 'refund', 'escalate', 'survey'
      ];

      const availableTools = this.toolExecutionService.getAvailableTools(allTools);

      res.json({
        success: true,
        data: availableTools
      });

    } catch (error) {
      console.error('❌ Error getting available tools:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available tools'
      });
    }
  }

  /**
   * Test tool configuration
   * POST /api/company/agents/:agentId/tools/test
   */
  async testTool(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req.company;
      const { toolId, parameters } = req.body;

      if (!toolId) {
        return res.status(400).json({
          success: false,
          error: 'Tool ID is required'
        });
      }

      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      // Test the tool with minimal parameters
      const testParameters = parameters || { test: true };
      const context = {
        agentId,
        companyId,
        userId: req.user?.userId,
        agent: agent
      };

      const result = await this.toolExecutionService.executeTool(toolId, testParameters, context);

      res.json({
        success: result.success,
        message: result.success ? 'Tool test successful' : 'Tool test failed',
        data: result
      });

    } catch (error) {
      console.error('❌ Error testing tool:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test tool'
      });
    }
  }
}

export default new ToolController();
