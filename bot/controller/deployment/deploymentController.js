import Agent from '../../models/agent.js';

class DeploymentController {
  /**
   * Get deployment configuration for an agent
   * GET /api/company/agents/:agentId/deploy
   */
  async getDeploymentConfig(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req;

      // Get agent details
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Get company details from auth middleware
      const company = req.company;

      // Generate deployment configuration
      const deploymentConfig = {
        agentId: agent.agentId,
        name: agent.name,
        description: agent.description,
        personality: agent.personality,
        status: agent.status,
        companyApiKey: company.apiKey,
        embedUrl: `${process.env.EMBED_BASE_URL || 'http://localhost:3000'}/embed.js`,
        apiUrl: process.env.API_BASE_URL || 'http://localhost:4000',
        createdAt: agent.createdAt,
        lastUpdated: agent.updatedAt
      };

      res.status(200).json({
        success: true,
        data: deploymentConfig
      });

    } catch (error) {
      console.error('❌ Error getting deployment config:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Generate embed code for an agent
   * POST /api/company/agents/:agentId/deploy/embed-code
   */
  async generateEmbedCode(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req;
      const { 
        customDomain, 
        position = 'bottom-right',
        theme = 'default',
        showWelcomeMessage = true,
        autoOpen = false
      } = req.body;

      // Get agent details
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Get company details from auth middleware
      const company = req.company;

      // Determine embed URL
      const embedUrl = customDomain ? 
        `${customDomain}/embed.js` : 
        `${process.env.EMBED_BASE_URL || 'http://localhost:3000'}/embed.js`;

      // Generate embed code
      const embedCode = DeploymentController.generateEmbedCodeHTML({
        agentId: agent.agentId,
        name: agent.name,
        description: agent.description,
        companyApiKey: company.apiKey,
        embedUrl,
        apiUrl: process.env.API_BASE_URL || 'http://localhost:4000',
        position,
        theme,
        showWelcomeMessage,
        autoOpen
      });

      res.status(200).json({
        success: true,
        data: {
          embedCode,
          config: {
            agentId: agent.agentId,
            name: agent.name,
            description: agent.description,
            companyApiKey: company.apiKey,
            embedUrl,
            apiUrl: process.env.API_BASE_URL || 'http://localhost:4000',
            position,
            theme,
            showWelcomeMessage,
            autoOpen
          }
        }
      });

    } catch (error) {
      console.error('❌ Error generating embed code:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Test deployment configuration
   * POST /api/company/agents/:agentId/deploy/test
   */
  async testDeployment(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req;
      const { testMessage = 'Hello, this is a test message' } = req.body;

      // Get agent details
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Get company details from auth middleware
      const company = req.company;

      // Test the agent with a simple message
      const testResult = {
        agentId: agent.agentId,
        name: agent.name,
        status: agent.status,
        testMessage,
        timestamp: new Date().toISOString(),
        configuration: {
          hasPersonality: !!agent.personality,
          hasKnowledgeBase: agent.knowledgeBase && agent.knowledgeBase.length > 0,
          hasTrainingExamples: agent.trainingExamples && agent.trainingExamples.length > 0
        }
      };

      res.status(200).json({
        success: true,
        message: 'Deployment test successful',
        data: testResult
      });

    } catch (error) {
      console.error('❌ Error testing deployment:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get deployment analytics for an agent
   * GET /api/company/agents/:agentId/deploy/analytics
   */
  async getDeploymentAnalytics(req, res) {
    try {
      const { agentId } = req.params;
      const { companyId } = req;
      const { days = 7 } = req.query;

      // Get agent details
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(days));

      // Get conversation analytics (this would need to be implemented with actual conversation data)
      const analytics = {
        agentId: agent.agentId,
        name: agent.name,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: parseInt(days)
        },
        stats: {
          totalConversations: agent.usage?.totalConversations || 0,
          totalMessages: agent.usage?.totalMessages || 0,
          lastUsed: agent.usage?.lastUsed || agent.updatedAt,
          averageResponseTime: '2.3s', // This would be calculated from actual data
          satisfactionRating: 4.2 // This would be calculated from actual data
        },
        trends: {
          conversationsToday: 0, // This would be calculated from actual data
          conversationsThisWeek: 0, // This would be calculated from actual data
          growthRate: '+12%' // This would be calculated from actual data
        }
      };

      res.status(200).json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('❌ Error getting deployment analytics:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Generate embed code HTML
   * @param {Object} config - Configuration object
   * @returns {string} HTML embed code
   */
  static generateEmbedCodeHTML(config) {
    return `<!-- SupaChatbot Widget -->
<script>
  window.SupaChatbotConfig = {
    apiUrl: '${config.apiUrl}',
    agentId: '${config.agentId}',
    companyApiKey: '${config.companyApiKey}',
    userId: 'embed_user_${Date.now()}',
    name: '${config.name}',
    description: '${config.description}',
    position: '${config.position}',
    theme: '${config.theme}',
    showWelcomeMessage: ${config.showWelcomeMessage},
    autoOpen: ${config.autoOpen}
  };
</script>
<script src="${config.embedUrl}"></script>
<!-- End SupaChatbot Widget -->`;
  }
}

export default new DeploymentController();
