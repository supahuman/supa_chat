'use client';

import { useState, useEffect } from 'react';
import { useGetCompanyAgentsQuery } from '@/store/botApi';
import { hasValidCredentials, setupMockCredentials } from '@/utils/auth';

export const useEmbeds = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [copiedEmbedId, setCopiedEmbedId] = useState(null);

  // Set up mock credentials if none exist
  useEffect(() => {
    if (!hasValidCredentials()) {
      setupMockCredentials();
    }
  }, []);

  // Use RTK Query to fetch company agents
  const { data: agentsData, isLoading, error: queryError, refetch } = useGetCompanyAgentsQuery();
  
  // Check if we have API credentials
  const hasCredentials = hasValidCredentials();

  // Use mock data if no credentials or API fails
  const mockAgents = [
    {
      agentId: 'agent_1234567890_abc123',
      name: 'Support Bot',
      description: 'AI Agent for customer support',
      personality: 'friendly and helpful',
      status: 'active',
      usage: {
        totalConversations: 15,
        totalMessages: 45,
        lastUsed: '2024-01-15T10:30:00Z'
      },
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
      agentId: 'agent_1234567891_def456',
      name: 'Sales Assistant',
      description: 'AI Agent for sales inquiries',
      personality: 'professional and persuasive',
      status: 'inactive',
      usage: {
        totalConversations: 8,
        totalMessages: 22,
        lastUsed: '2024-01-14T16:45:00Z'
      },
      createdAt: '2024-01-12T14:20:00Z'
    }
  ];

  const agents = agentsData?.success ? agentsData.data : mockAgents;
  const loading = isLoading;
  const error = queryError ? 'Failed to fetch agents from database' : null;

  const handleCopyEmbedCode = async (agentId) => {
    try {
      // Generate a simple embed code for copying
      const embedCode = `<!-- SupaChatbot Widget -->
<script>
  window.SupaChatbotConfig = {
    apiUrl: 'http://localhost:4000',
    agentId: '${agentId}',
    companyApiKey: '${typeof window !== 'undefined' ? localStorage.getItem('companyApiKey') : 'your_company_key'}',
    userId: 'embed_user_${Date.now()}',
    name: 'AI Assistant',
    description: 'How can I help you today?',
    position: 'bottom-right',
    theme: 'default',
    showWelcomeMessage: true,
    autoOpen: false
  };
</script>
<script src="http://localhost:3000/embed.js"></script>
<!-- End SupaChatbot Widget -->`;

      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbedId(agentId);
      setTimeout(() => setCopiedEmbedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy embed code:', error);
    }
  };

  const handleConfigureEmbed = (agent) => {
    setSelectedAgent(agent);
  };

  const handleCloseDeploymentSettings = () => {
    setSelectedAgent(null);
  };

  const handleCreateEmbed = () => {
    // Navigate to agents or show create agent flow
    console.log('Create embed clicked');
  };

  const handleGoToAgents = () => {
    // Navigate to agents tab
    console.log('Go to agents clicked');
  };

  return {
    agents,
    loading,
    error,
    selectedAgent,
    copiedEmbedId,
    handleCopyEmbedCode,
    handleConfigureEmbed,
    handleCloseDeploymentSettings,
    handleCreateEmbed,
    handleGoToAgents,
    refetch
  };
};
