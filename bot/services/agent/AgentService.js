import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service for managing human agents and escalations
 */
class AgentService {
  constructor() {
    this.agentsFile = path.join(__dirname, '../../data/agents.json');
    this.escalationsFile = path.join(__dirname, '../../data/escalations.json');
    this.activeAgents = new Map(); // clientId -> agentId
    this.escalationQueue = new Map(); // clientId -> escalation data
    this.loadAgents();
    this.loadEscalations();
  }

  /**
   * Load agents from file
   */
  loadAgents() {
    try {
      if (fsSync.existsSync(this.agentsFile)) {
        const data = fsSync.readFileSync(this.agentsFile, 'utf8');
        this.agents = JSON.parse(data);
      } else {
        this.agents = [];
        this.saveAgents();
      }
    } catch (error) {
      console.error('❌ Error loading agents:', error);
      this.agents = [];
    }
  }

  /**
   * Save agents to file
   */
  saveAgents() {
    try {
      fsSync.writeFileSync(this.agentsFile, JSON.stringify(this.agents, null, 2));
    } catch (error) {
      console.error('❌ Error saving agents:', error);
    }
  }

  /**
   * Load escalations from file
   */
  loadEscalations() {
    try {
      if (fsSync.existsSync(this.escalationsFile)) {
        const data = fsSync.readFileSync(this.escalationsFile, 'utf8');
        this.escalations = JSON.parse(data);
      } else {
        this.escalations = [];
        this.saveEscalations();
      }
    } catch (error) {
      console.error('❌ Error loading escalations:', error);
      this.escalations = [];
    }
  }

  /**
   * Save escalations to file
   */
  saveEscalations() {
    try {
      fsSync.writeFileSync(this.escalationsFile, JSON.stringify(this.escalations, null, 2));
    } catch (error) {
      console.error('❌ Error saving escalations:', error);
    }
  }

  /**
   * Create a new agent
   */
  createAgent(agentData) {
    const agent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: agentData.name,
      email: agentData.email,
      clientId: agentData.clientId,
      status: 'offline', // offline, online, busy, away
      skills: agentData.skills || [],
      maxConcurrentChats: agentData.maxConcurrentChats || 3,
      currentChats: 0,
      availability: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '10:00', end: '14:00', available: false },
        sunday: { start: '10:00', end: '14:00', available: false }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.agents.push(agent);
    this.saveAgents();
    return agent;
  }

  /**
   * Get agents for a specific client
   */
  getAgentsByClient(clientId) {
    return this.agents.filter(agent => agent.clientId === clientId);
  }

  /**
   * Get available agents for a client
   */
  getAvailableAgents(clientId) {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().substring(0, 5);

    return this.agents.filter(agent => {
      if (agent.clientId !== clientId) return false;
      if (agent.status !== 'online') return false;
      if (agent.currentChats >= agent.maxConcurrentChats) return false;

      const availability = agent.availability[dayOfWeek];
      if (!availability || !availability.available) return false;

      return currentTime >= availability.start && currentTime <= availability.end;
    });
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId, status) {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) {
      agent.status = status;
      agent.updatedAt = new Date().toISOString();
      this.saveAgents();
      return agent;
    }
    return null;
  }

  /**
   * Assign agent to a chat
   */
  assignAgentToChat(agentId, clientId, sessionId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent && agent.currentChats < agent.maxConcurrentChats) {
      agent.currentChats++;
      agent.updatedAt = new Date().toISOString();
      this.activeAgents.set(clientId, agentId);
      this.saveAgents();
      return agent;
    }
    return null;
  }

  /**
   * Release agent from a chat
   */
  releaseAgentFromChat(agentId, clientId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (agent) {
      agent.currentChats = Math.max(0, agent.currentChats - 1);
      agent.updatedAt = new Date().toISOString();
      this.activeAgents.delete(clientId);
      this.saveAgents();
      return agent;
    }
    return null;
  }

  /**
   * Create escalation
   */
  createEscalation(escalationData) {
    const escalation = {
      id: `escalation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId: escalationData.clientId,
      sessionId: escalationData.sessionId,
      userId: escalationData.userId,
      reason: escalationData.reason,
      priority: escalationData.priority || 'medium', // low, medium, high, urgent
      status: 'pending', // pending, assigned, in_progress, resolved, closed
      assignedAgent: null,
      messages: escalationData.messages || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.escalations.push(escalation);
    this.escalationQueue.set(escalation.clientId, escalation);
    this.saveEscalations();
    return escalation;
  }

  /**
   * Get escalations for a client
   */
  getEscalationsByClient(clientId) {
    return this.escalations.filter(escalation => escalation.clientId === clientId);
  }

  /**
   * Get pending escalations
   */
  getPendingEscalations() {
    return this.escalations.filter(escalation => escalation.status === 'pending');
  }

  /**
   * Assign escalation to agent
   */
  assignEscalation(escalationId, agentId) {
    const escalation = this.escalations.find(e => e.id === escalationId);
    const agent = this.agents.find(a => a.id === agentId);

    if (escalation && agent) {
      escalation.assignedAgent = agentId;
      escalation.status = 'assigned';
      escalation.updatedAt = new Date().toISOString();
      this.saveEscalations();
      return escalation;
    }
    return null;
  }

  /**
   * Update escalation status
   */
  updateEscalationStatus(escalationId, status) {
    const escalation = this.escalations.find(e => e.id === escalationId);
    if (escalation) {
      escalation.status = status;
      escalation.updatedAt = new Date().toISOString();
      this.saveEscalations();
      return escalation;
    }
    return null;
  }

  /**
   * Add message to escalation
   */
  addMessageToEscalation(escalationId, message) {
    const escalation = this.escalations.find(e => e.id === escalationId);
    if (escalation) {
      escalation.messages.push({
        ...message,
        timestamp: new Date().toISOString()
      });
      escalation.updatedAt = new Date().toISOString();
      this.saveEscalations();
      return escalation;
    }
    return null;
  }

  /**
   * Check if escalation should be triggered
   */
  shouldEscalate(clientId, message, context = {}) {
    const escalationRules = this.getEscalationRules(clientId);
    
    for (const rule of escalationRules) {
      if (this.evaluateEscalationRule(rule, message, context)) {
        return {
          shouldEscalate: true,
          reason: rule.reason,
          priority: rule.priority
        };
      }
    }

    return { shouldEscalate: false };
  }

  /**
   * Get escalation rules for a client
   */
  getEscalationRules(clientId) {
    // Default escalation rules - can be customized per client
    return [
      {
        id: 'sentiment_negative',
        name: 'Negative Sentiment',
        condition: 'sentiment < -0.5',
        reason: 'Customer appears frustrated or upset',
        priority: 'high'
      },
      {
        id: 'keyword_escalation',
        name: 'Escalation Keywords',
        condition: 'message contains ["speak to human", "agent", "manager", "supervisor"]',
        reason: 'Customer requested human assistance',
        priority: 'medium'
      },
      {
        id: 'unresolved_queries',
        name: 'Unresolved Queries',
        condition: 'unresolvedCount >= 3',
        reason: 'Multiple unresolved queries',
        priority: 'medium'
      },
      {
        id: 'complex_technical',
        name: 'Complex Technical Issue',
        condition: 'message contains technical keywords AND length > 100',
        reason: 'Complex technical issue requiring human expertise',
        priority: 'high'
      }
    ];
  }

  /**
   * Evaluate escalation rule
   */
  evaluateEscalationRule(rule, message, context) {
    switch (rule.id) {
      case 'sentiment_negative':
        return context.sentiment && context.sentiment < -0.5;
      
      case 'keyword_escalation':
        const keywords = ['speak to human', 'agent', 'manager', 'supervisor', 'human', 'person'];
        return keywords.some(keyword => 
          message.toLowerCase().includes(keyword.toLowerCase())
        );
      
      case 'unresolved_queries':
        return context.unresolvedCount >= 3;
      
      case 'complex_technical':
        const technicalKeywords = ['error', 'bug', 'issue', 'problem', 'not working', 'broken'];
        const hasTechnicalKeywords = technicalKeywords.some(keyword => 
          message.toLowerCase().includes(keyword.toLowerCase())
        );
        return hasTechnicalKeywords && message.length > 100;
      
      default:
        return false;
    }
  }

  /**
   * Get agent statistics
   */
  getAgentStats(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return null;

    const agentEscalations = this.escalations.filter(e => e.assignedAgent === agentId);
    
    return {
      agent,
      totalEscalations: agentEscalations.length,
      resolvedEscalations: agentEscalations.filter(e => e.status === 'resolved').length,
      pendingEscalations: agentEscalations.filter(e => e.status === 'pending').length,
      averageResponseTime: this.calculateAverageResponseTime(agentEscalations),
      currentLoad: agent.currentChats / agent.maxConcurrentChats
    };
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime(escalations) {
    const resolvedEscalations = escalations.filter(e => e.status === 'resolved');
    if (resolvedEscalations.length === 0) return 0;

    const totalTime = resolvedEscalations.reduce((total, escalation) => {
      const created = new Date(escalation.createdAt);
      const resolved = new Date(escalation.updatedAt);
      return total + (resolved - created);
    }, 0);

    return totalTime / resolvedEscalations.length;
  }
}

export default AgentService;
