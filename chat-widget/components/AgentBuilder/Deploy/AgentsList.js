"use client";

import { useEffect } from "react";
import {
  Users,
  Plus,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit,
  BarChart3,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Button } from "@/ui";
import { Card } from "@/ui";
import {
  useGetCompanyAgentsQuery,
  useDeleteCompanyAgentMutation,
} from "@/store/botApi";
import { hasValidCredentials } from "@/utils/auth";

const AgentsList = ({
  onNavigateToEmbeds,
  onEditAgent,
  onSelectAgent,
  showEditButton = true,
}) => {
  const [deleteAgent, { isLoading: isDeleting }] =
    useDeleteCompanyAgentMutation();

  // Set up mock credentials if none exist
  useEffect(() => {
    if (!hasValidCredentials()) {
      // No mock credentials - require proper authentication
    }
  }, []);

  // Use RTK Query to fetch company agents
  const {
    data: agentsData,
    isLoading,
    error: queryError,
    refetch,
  } = useGetCompanyAgentsQuery();

  // Check if we have API credentials
  const hasCredentials = hasValidCredentials();

  // Use mock data if no credentials or API fails
  const mockAgents = [
    {
      agentId: "agent_1234567890_abc123",
      name: "Support Bot",
      description: "AI Agent for customer support",
      personality: "friendly and helpful",
      status: "active",
      usage: {
        totalConversations: 15,
        totalMessages: 45,
        lastUsed: "2024-01-15T10:30:00Z",
      },
      createdAt: "2024-01-10T09:00:00Z",
    },
    {
      agentId: "agent_1234567891_def456",
      name: "Sales Assistant",
      description: "AI Agent for sales inquiries",
      personality: "professional and persuasive",
      status: "inactive",
      usage: {
        totalConversations: 8,
        totalMessages: 22,
        lastUsed: "2024-01-14T16:45:00Z",
      },
      createdAt: "2024-01-12T14:20:00Z",
    },
  ];

  const agents = agentsData?.success ? agentsData.data : mockAgents;
  const loading = isLoading;
  const error = queryError ? "Failed to fetch agents from database" : null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "training":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleDeployAgent = (agent) => {
    // Navigate to embeds tab with selected agent
    console.log("Deploy agent:", agent.name);
    // TODO: Implement navigation to embeds tab
  };

  // Handle agent deletion with confirmation
  const handleDeleteAgent = async (agentId, agentName) => {
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to delete &quot;${agentName}&quot;?\n\nThis action cannot be undone and will permanently remove:\n• Agent configuration\n• All conversations\n• Knowledge base data\n• Deployment settings\n\nType &quot;DELETE&quot; to confirm:`
    );

    if (confirmed) {
      const userInput = window.prompt(
        "Type &quot;DELETE&quot; to confirm deletion:"
      );
      if (userInput === "DELETE") {
        try {
          await deleteAgent(agentId).unwrap();
          alert("✅ Agent deleted successfully");
          refetch(); // Refresh the list
        } catch (error) {
          console.error("Failed to delete agent:", error);
          console.error("Error details:", {
            message: error?.message,
            status: error?.status,
            data: error?.data,
            originalStatus: error?.originalStatus,
            error: error?.error,
          });

          // Show user-friendly error message
          alert(
            `❌ Failed to delete agent: ${
              error?.data?.error || error?.message || "Unknown error"
            }`
          );
        }
      } else {
        alert("❌ Deletion cancelled - confirmation text did not match");
      }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Your Agents
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor your deployed AI agents
          </p>
        </div>
        <Button icon={Plus} variant="primary" className="w-full sm:w-auto">
          Create Agent
        </Button>
      </div>

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No agents yet
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            Create your first AI agent to get started
          </p>
          <Button icon={Plus} variant="primary" className="w-full sm:w-auto">
            Create Your First Agent
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {agents.map((agent) => (
            <Card
              key={agent.agentId}
              className="p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                    {agent.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {agent.description}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      agent.status
                    )}`}
                  >
                    {agent.status}
                  </span>
                </div>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {agent.usage.totalConversations}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Conversations
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {agent.usage.totalMessages}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Messages
                  </div>
                </div>
              </div>

              {/* API Key */}
              {agent.apiKey && (
                <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        API Key
                      </div>
                      <div className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                        {agent.apiKey}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(agent.apiKey);
                        // You could add a toast notification here
                      }}
                      className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      title="Copy API Key"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Last Used */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Last used: {formatDate(agent.usage.lastUsed)}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {/* Primary Actions Row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={ExternalLink}
                    onClick={() => handleDeployAgent(agent)}
                    className="flex-1"
                  >
                    Deploy
                  </Button>
                  {showEditButton && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Edit}
                      className="flex-1"
                      onClick={() => onEditAgent && onEditAgent(agent)}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {/* Secondary Actions Row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={agent.status === "active" ? Pause : Play}
                    className="flex-1"
                  >
                    {agent.status === "active" ? "Pause" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={BarChart3}
                    className="flex-1"
                  >
                    Analytics
                  </Button>
                </div>

                {/* Danger Zone - Delete Button */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Trash2}
                    onClick={() => handleDeleteAgent(agent.agentId, agent.name)}
                    disabled={isDeleting}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                  >
                    {isDeleting ? "Deleting..." : "Delete Agent"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentsList;
