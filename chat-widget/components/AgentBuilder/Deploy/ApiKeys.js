"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { useGetCompanyAgentsQuery } from "@/store/botApi";
import { hasValidCredentials } from "@/utils/auth";

const ApiKeys = () => {
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});

  useEffect(() => {
    if (!hasValidCredentials()) {
      // No mock credentials - require proper authentication
    }
  }, []);

  const { data: agentsData, isLoading } = useGetCompanyAgentsQuery();
  const agents = agentsData?.success ? agentsData.data : [];

  const handleCopyKey = async (apiKey, agentId) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKeyId(agentId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (error) {
      console.error("Failed to copy API key:", error);
    }
  };

  const toggleKeyVisibility = (agentId) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
  };

  const maskApiKey = (apiKey) => {
    if (!apiKey) return "No API key available";
    return (
      apiKey.substring(0, 8) +
      "•".repeat(apiKey.length - 12) +
      apiKey.substring(apiKey.length - 4)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          API Keys
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Copy your agent API keys
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No agents found. Create an agent to get an API key.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.agentId}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {visibleKeys[agent.agentId]
                      ? agent.apiKey
                      : maskApiKey(agent.apiKey)}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleKeyVisibility(agent.agentId)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title={
                      visibleKeys[agent.agentId]
                        ? "Hide API key"
                        : "Show API key"
                    }
                  >
                    {visibleKeys[agent.agentId] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleCopyKey(agent.apiKey, agent.agentId)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Copy API key"
                  >
                    {copiedKeyId === agent.agentId ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
