import AgentService from '../services/agent/AgentService.js';

/**
 * Controller for handling escalations and human agent interactions
 */
class EscalationController {
  constructor() {
    this.agentService = new AgentService();
    
    // Bind methods to preserve 'this' context
    this.createAgent = this.createAgent.bind(this);
    this.getAgents = this.getAgents.bind(this);
    this.updateAgentStatus = this.updateAgentStatus.bind(this);
    this.createEscalation = this.createEscalation.bind(this);
    this.getEscalations = this.getEscalations.bind(this);
    this.assignEscalation = this.assignEscalation.bind(this);
    this.updateEscalationStatus = this.updateEscalationStatus.bind(this);
    this.addMessageToEscalation = this.addMessageToEscalation.bind(this);
    this.getAgentStats = this.getAgentStats.bind(this);
  }

  /**
   * Create a new agent
   */
  async createAgent(req, res) {
    try {
      const { name, email, clientId, skills, maxConcurrentChats, availability } = req.body;

      if (!name || !email || !clientId) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and clientId are required'
        });
      }

      const agent = this.agentService.createAgent({
        name,
        email,
        clientId,
        skills,
        maxConcurrentChats,
        availability
      });

      res.status(201).json({
        success: true,
        data: agent,
        message: 'Agent created successfully'
      });
    } catch (error) {
      console.error('❌ Error creating agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create agent'
      });
    }
  }

  /**
   * Get agents for a client
   */
  async getAgents(req, res) {
    try {
      const { clientId } = req.params;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          error: 'Client ID is required'
        });
      }

      const agents = this.agentService.getAgentsByClient(clientId);

      res.json({
        success: true,
        data: agents,
        count: agents.length
      });
    } catch (error) {
      console.error('❌ Error getting agents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agents'
      });
    }
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(req, res) {
    try {
      const { agentId } = req.params;
      const { status } = req.body;

      if (!status || !['offline', 'online', 'busy', 'away'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Valid status is required (offline, online, busy, away)'
        });
      }

      const agent = this.agentService.updateAgentStatus(agentId, status);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      res.json({
        success: true,
        data: agent,
        message: 'Agent status updated successfully'
      });
    } catch (error) {
      console.error('❌ Error updating agent status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update agent status'
      });
    }
  }

  /**
   * Create escalation
   */
  async createEscalation(req, res) {
    try {
      const { clientId, sessionId, userId, reason, priority, messages } = req.body;

      if (!clientId || !sessionId || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Client ID, session ID, and reason are required'
        });
      }

      const escalation = this.agentService.createEscalation({
        clientId,
        sessionId,
        userId,
        reason,
        priority,
        messages
      });

      // Try to assign to available agent
      const availableAgents = this.agentService.getAvailableAgents(clientId);
      if (availableAgents.length > 0) {
        const assignedAgent = availableAgents[0];
        this.agentService.assignEscalation(escalation.id, assignedAgent.id);
        this.agentService.assignAgentToChat(assignedAgent.id, clientId, sessionId);
      }

      res.status(201).json({
        success: true,
        data: escalation,
        message: 'Escalation created successfully'
      });
    } catch (error) {
      console.error('❌ Error creating escalation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create escalation'
      });
    }
  }

  /**
   * Get escalations for a client
   */
  async getEscalations(req, res) {
    try {
      const { clientId } = req.params;
      const { status, agentId } = req.query;

      let escalations = this.agentService.getEscalationsByClient(clientId);

      if (status) {
        escalations = escalations.filter(e => e.status === status);
      }

      if (agentId) {
        escalations = escalations.filter(e => e.assignedAgent === agentId);
      }

      res.json({
        success: true,
        data: escalations,
        count: escalations.length
      });
    } catch (error) {
      console.error('❌ Error getting escalations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get escalations'
      });
    }
  }

  /**
   * Assign escalation to agent
   */
  async assignEscalation(req, res) {
    try {
      const { escalationId } = req.params;
      const { agentId } = req.body;

      if (!agentId) {
        return res.status(400).json({
          success: false,
          error: 'Agent ID is required'
        });
      }

      const escalation = this.agentService.assignEscalation(escalationId, agentId);

      if (!escalation) {
        return res.status(404).json({
          success: false,
          error: 'Escalation not found'
        });
      }

      res.json({
        success: true,
        data: escalation,
        message: 'Escalation assigned successfully'
      });
    } catch (error) {
      console.error('❌ Error assigning escalation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign escalation'
      });
    }
  }

  /**
   * Update escalation status
   */
  async updateEscalationStatus(req, res) {
    try {
      const { escalationId } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'assigned', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Valid status is required'
        });
      }

      const escalation = this.agentService.updateEscalationStatus(escalationId, status);

      if (!escalation) {
        return res.status(404).json({
          success: false,
          error: 'Escalation not found'
        });
      }

      res.json({
        success: true,
        data: escalation,
        message: 'Escalation status updated successfully'
      });
    } catch (error) {
      console.error('❌ Error updating escalation status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update escalation status'
      });
    }
  }

  /**
   * Add message to escalation
   */
  async addMessageToEscalation(req, res) {
    try {
      const { escalationId } = req.params;
      const { content, sender, senderType } = req.body; // senderType: 'agent' or 'customer'

      if (!content || !sender || !senderType) {
        return res.status(400).json({
          success: false,
          error: 'Content, sender, and senderType are required'
        });
      }

      const escalation = this.agentService.addMessageToEscalation(escalationId, {
        content,
        sender,
        senderType
      });

      if (!escalation) {
        return res.status(404).json({
          success: false,
          error: 'Escalation not found'
        });
      }

      res.json({
        success: true,
        data: escalation,
        message: 'Message added to escalation successfully'
      });
    } catch (error) {
      console.error('❌ Error adding message to escalation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add message to escalation'
      });
    }
  }

  /**
   * Get agent statistics
   */
  async getAgentStats(req, res) {
    try {
      const { agentId } = req.params;

      const stats = this.agentService.getAgentStats(agentId);

      if (!stats) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error getting agent stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agent statistics'
      });
    }
  }

  /**
   * Check if message should be escalated
   */
  async checkEscalation(req, res) {
    try {
      const { clientId, message, context } = req.body;

      if (!clientId || !message) {
        return res.status(400).json({
          success: false,
          error: 'Client ID and message are required'
        });
      }

      const escalationCheck = this.agentService.shouldEscalate(clientId, message, context);

      res.json({
        success: true,
        data: escalationCheck
      });
    } catch (error) {
      console.error('❌ Error checking escalation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check escalation'
      });
    }
  }
}

export default EscalationController;
