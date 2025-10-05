'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, MoreVertical, Play, Pause, Trash2, Edit, BarChart3 } from 'lucide-react';
import { Button } from '@/ui';
import { Card } from '@/ui';
import { useGetCompanyAgentsQuery } from '@/store/botApi';
import { setCompanyCredentials, hasValidCredentials, setupMockCredentials } from '@/utils/auth';

const AgentsList = () => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'training':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <Users className="w-12 h-12 mx-auto mb-2" />
          <p>{error}</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Agents</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor your deployed AI agents
          </p>
        </div>
        <Button icon={Plus} variant="primary">
          Create Agent
        </Button>
      </div>

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No agents yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first AI agent to get started
          </p>
          <Button icon={Plus} variant="primary">
            Create Your First Agent
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.agentId} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {agent.description}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {agent.usage.totalConversations}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Conversations
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {agent.usage.totalMessages}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Messages
                  </div>
                </div>
              </div>

              {/* Last Used */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Last used: {formatDate(agent.usage.lastUsed)}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={agent.status === 'active' ? Pause : Play}
                  className="flex-1"
                >
                  {agent.status === 'active' ? 'Pause' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={BarChart3}
                  className="flex-1"
                >
                  Analytics
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit}
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentsList;
