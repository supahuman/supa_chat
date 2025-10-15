"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Settings,
  Code,
  BarChart3,
  Play,
} from "lucide-react";
import { Button } from "@/ui";
import { Card } from "@/ui";
import {
  useGetDeploymentConfigQuery,
  useGenerateEmbedCodeMutation,
  useTestDeploymentMutation,
  useGetDeploymentAnalyticsQuery,
} from "@/store/botApi";

const DeploymentSettings = ({ selectedAgent }) => {
  const [activeTab, setActiveTab] = useState("embed");
  const [embedConfig, setEmbedConfig] = useState({
    position: "bottom-right",
    theme: "default",
    showWelcomeMessage: true,
    autoOpen: false,
    customDomain: "",
  });
  const [copied, setCopied] = useState(false);
  const [embedCode, setEmbedCode] = useState("");

  // API hooks
  const { data: deploymentConfig, isLoading: configLoading } =
    useGetDeploymentConfigQuery(selectedAgent?.agentId, {
      skip: !selectedAgent?.agentId,
    });

  const { data: analytics, isLoading: analyticsLoading } =
    useGetDeploymentAnalyticsQuery(
      { agentId: selectedAgent?.agentId, days: 7 },
      { skip: !selectedAgent?.agentId }
    );

  const [generateEmbedCode, { isLoading: generatingCode }] =
    useGenerateEmbedCodeMutation();
  const [testDeployment, { isLoading: testing }] = useTestDeploymentMutation();

  const generateFallbackEmbedCode = useCallback(() => {
    const fallbackCode = `<!-- SupaChatbot Widget -->
<script>
  window.SupaChatbotConfig = {
    apiUrl: '${process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:4000"}',
    agentId: '${selectedAgent?.agentId}',
    companyApiKey: '${selectedAgent?.apiKey || "your_agent_api_key"}',
    userId: 'embed_user_${Date.now()}',
    name: '${selectedAgent?.name || "AI Assistant"}',
    description: '${selectedAgent?.description || "How can I help you today?"}',
    position: '${embedConfig.position}',
    theme: '${embedConfig.theme}',
    showWelcomeMessage: ${embedConfig.showWelcomeMessage},
    autoOpen: ${embedConfig.autoOpen}
  };
</script>
<script src="${
      process.env.NEXT_PUBLIC_EMBED_URL || "http://localhost:3000"
    }/embed.js"></script>
<!-- End SupaChatbot Widget -->`;

    setEmbedCode(fallbackCode);
    console.log("🔄 Using fallback embed code");
  }, [selectedAgent?.agentId, selectedAgent?.apiKey, embedConfig]);

  const handleGenerateCode = useCallback(async () => {
    if (!selectedAgent?.agentId) return;

    console.log("🔄 Generating embed code for agent:", selectedAgent.agentId);
    console.log("📋 Embed config:", embedConfig);

    try {
      const result = await generateEmbedCode({
        agentId: selectedAgent.agentId,
        ...embedConfig,
      }).unwrap();

      console.log("✅ Embed code generation result:", result);

      if (result.success) {
        setEmbedCode(result.data.embedCode);
        console.log(
          "📝 Embed code set:",
          result.data.embedCode.substring(0, 100) + "..."
        );
      } else {
        console.error("❌ Embed code generation failed:", result.message);
        // Generate fallback embed code
        generateFallbackEmbedCode();
      }
    } catch (error) {
      console.error("❌ Error generating embed code:", error);
      // Generate fallback embed code
      generateFallbackEmbedCode();
    }
  }, [
    selectedAgent?.agentId,
    embedConfig,
    generateEmbedCode,
    generateFallbackEmbedCode,
  ]);

  // Generate embed code when component mounts or config changes
  useEffect(() => {
    if (selectedAgent?.agentId) {
      handleGenerateCode();
    }
  }, [selectedAgent, embedConfig, handleGenerateCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleTestDeployment = async () => {
    if (!selectedAgent?.agentId) return;

    try {
      const result = await testDeployment({
        agentId: selectedAgent.agentId,
        testMessage:
          "Hello, this is a test message from the deployment system!",
      }).unwrap();

      if (result.success) {
        alert(
          "✅ Deployment test successful! Your agent is ready to be embedded."
        );
      }
    } catch (error) {
      console.error("Deployment test failed:", error);
      alert(
        "❌ Deployment test failed. Please check your agent configuration."
      );
    }
  };

  const tabs = [
    { id: "embed", label: "Embed Code", icon: Code },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Select an agent to configure deployment settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Deploy {selectedAgent.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure and deploy your AI agent to your website
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "embed" && (
        <div className="space-y-6">
          {/* Embed Code */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Embed Code
                </h4>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleGenerateCode}
                    variant="outline"
                    size="sm"
                    icon={Code}
                    loading={generatingCode}
                  >
                    Generate
                  </Button>
                  <Button
                    onClick={handleTestDeployment}
                    variant="secondary"
                    size="sm"
                    icon={Play}
                    loading={testing}
                  >
                    Test
                  </Button>
                  <Button
                    onClick={handleCopyCode}
                    variant="primary"
                    size="sm"
                    icon={copied ? Check : Copy}
                    disabled={!embedCode}
                  >
                    {copied ? "Copied!" : "Copy Code"}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{embedCode || "Generating embed code..."}</code>
                </pre>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  How to use:
                </h5>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Copy the embed code above</li>
                  <li>
                    Paste it into your website's HTML before the closing
                    &lt;/body&gt; tag
                  </li>
                  <li>
                    Your AI agent will appear as a chat widget on your website
                  </li>
                  <li>
                    Test the deployment to ensure everything works correctly
                  </li>
                </ol>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Widget Settings */}
          <Card>
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Widget Settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <select
                    value={embedConfig.position}
                    onChange={(e) =>
                      setEmbedConfig({
                        ...embedConfig,
                        position: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={embedConfig.theme}
                    onChange={(e) =>
                      setEmbedConfig({ ...embedConfig, theme: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="default">Default</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Custom Domain */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Domain (Optional)
                  </label>
                  <input
                    type="text"
                    value={embedConfig.customDomain}
                    onChange={(e) =>
                      setEmbedConfig({
                        ...embedConfig,
                        customDomain: e.target.value,
                      })
                    }
                    placeholder="https://yourdomain.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use your own domain to serve the embed script (advanced)
                  </p>
                </div>
              </div>

              {/* Toggle Options */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show Welcome Message
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Display a welcome message when the widget opens
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={embedConfig.showWelcomeMessage}
                    onChange={(e) =>
                      setEmbedConfig({
                        ...embedConfig,
                        showWelcomeMessage: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto Open
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically open the chat widget when the page loads
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={embedConfig.autoOpen}
                    onChange={(e) =>
                      setEmbedConfig({
                        ...embedConfig,
                        autoOpen: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* API Key Settings */}
          <Card>
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                API Key
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agent API Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={selectedAgent?.apiKey || "No API key available"}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    />
                    <Button
                      onClick={() => {
                        if (selectedAgent?.apiKey) {
                          navigator.clipboard.writeText(selectedAgent.apiKey);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      variant="secondary"
                      size="sm"
                      icon={copied ? Check : Copy}
                      disabled={!selectedAgent?.apiKey}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This API key is unique to your agent and is used for
                    authentication in embed codes and API calls.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    🔒 Security Notice
                  </h5>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                    <li>
                      Keep your API key secure and never share it publicly
                    </li>
                    <li>
                      This key provides access to your agent's chat
                      functionality
                    </li>
                    <li>
                      If compromised, you can regenerate it by creating a new
                      agent
                    </li>
                    <li>
                      The API key is automatically included in generated embed
                      codes
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    📖 Usage Examples
                  </h5>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                    <p>
                      <strong>In embed codes:</strong> The API key is
                      automatically included when you generate embed codes.
                    </p>
                    <p>
                      <strong>For API calls:</strong> Use this key in the{" "}
                      <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                        X-Company-Key
                      </code>{" "}
                      header.
                    </p>
                    <p>
                      <strong>For testing:</strong> You can test your agent
                      using this API key with tools like Postman or curl.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Conversations
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {analytics?.data?.stats?.totalConversations || 0}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <ExternalLink className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Messages
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {analytics?.data?.stats?.totalMessages || 0}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Satisfaction Rating
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {analytics?.data?.stats?.satisfactionRating || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card>
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Deployment Status
              </h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Agent Status
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAgent.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {selectedAgent.status}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Last Used
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {analytics?.data?.stats?.lastUsed
                      ? new Date(
                          analytics.data.stats.lastUsed
                        ).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Average Response Time
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {analytics?.data?.stats?.averageResponseTime || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeploymentSettings;
