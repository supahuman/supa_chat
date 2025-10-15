"use client";

import { useState, useEffect } from "react";
import { SUPPORT_TOOLS } from "./toolsData";
import ToolCard from "./ToolCard";
import { getCompanyCredentials } from "@/utils/auth";

const Tools = ({ currentAgentId }) => {
  const [enabledTools, setEnabledTools] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load agent tools from backend
  useEffect(() => {
    const loadAgentTools = async () => {
      console.log("🔧 Tools: Loading agent tools for agentId:", currentAgentId);

      if (!currentAgentId) {
        console.log("🔧 Tools: No agentId, showing empty tools for new agent");
        setEnabledTools({});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { companyApiKey, userId } = getCompanyCredentials();
        const headers = {
          "X-Company-Key": companyApiKey,
          "X-User-ID": userId,
        };

        console.log(
          "🔧 Tools: Making API call to:",
          `/api/company/agents/${currentAgentId}/tools`
        );
        console.log("🔧 Tools: Headers:", headers);

        const response = await fetch(
          `/api/company/agents/${currentAgentId}/tools`,
          {
            headers,
          }
        );

        console.log("🔧 Tools: Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("🔧 Tools: Response data:", data);
          const toolsState = {};
          if (data.data?.enabled) {
            data.data.enabled.forEach((toolId) => {
              toolsState[toolId] = true;
            });
          }
          setEnabledTools(toolsState);
        } else if (response.status === 404) {
          console.log(
            "🔧 Tools: Agent has no tools data yet, starting with empty tools"
          );
          setEnabledTools({});
        } else {
          console.error(
            "🔧 Tools: API error:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("🔧 Tools: Failed to load agent tools:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAgentTools();
  }, [currentAgentId]);

  const handleToolToggle = async (toolId) => {
    console.log("🔧 Tool toggle clicked:", toolId);
    console.log("🔧 Current enabled tools:", enabledTools);

    const newEnabledTools = {
      ...enabledTools,
      [toolId]: !enabledTools[toolId],
    };

    console.log("🔧 New enabled tools:", newEnabledTools);
    setEnabledTools(newEnabledTools);

    // Save to backend
    if (currentAgentId) {
      try {
        setSaving(true);
        const enabledToolIds = Object.keys(newEnabledTools).filter(
          (id) => newEnabledTools[id]
        );

        const { companyApiKey, userId } = getCompanyCredentials();
        const headers = {
          "Content-Type": "application/json",
          "X-Company-Key": companyApiKey,
          "X-User-ID": userId,
        };

        const response = await fetch(
          `/api/company/agents/${currentAgentId}/tools`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              enabled: enabledToolIds,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save tools");
        }

        // Tools saved successfully
        console.log("✅ Tools saved successfully");
      } catch (error) {
        console.error("Failed to save tools:", error);
        // Revert on error
        setEnabledTools(enabledTools);
      } finally {
        setSaving(false);
      }
    }
  };

  const enabledCount = Object.values(enabledTools).filter(Boolean).length;

  // Test enabled tools
  const testTools = async () => {
    console.log("🧪 Test button clicked!");
    console.log("🧪 Current agent ID:", currentAgentId);
    console.log("🧪 Enabled tools:", enabledTools);

    if (!currentAgentId) {
      console.log("🧪 No agentId found, cannot test tools");
      alert("❌ No agent selected. Please create and save an agent first.");
      return;
    }

    const enabledToolIds = Object.keys(enabledTools).filter(
      (id) => enabledTools[id]
    );
    console.log("🧪 Testing tools:", enabledToolIds);

    if (enabledToolIds.length === 0) {
      console.log("🧪 No tools enabled");
      alert("❌ No tools enabled. Please enable some tools first.");
      return;
    }

    for (const toolId of enabledToolIds) {
      try {
        const { companyApiKey, userId } = getCompanyCredentials();
        const headers = {
          "Content-Type": "application/json",
          "X-Company-Key": companyApiKey,
          "X-User-ID": userId,
        };

        const testParams = {
          test: true,
          toolId: toolId,
          timestamp: new Date().toISOString(),
        };

        console.log(`🧪 Testing ${toolId} with params:`, testParams);

        const response = await fetch(
          `/api/company/agents/${currentAgentId}/tools/execute`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              toolId,
              parameters: testParams,
            }),
          }
        );

        const result = await response.json();
        console.log(`🧪 ${toolId} result:`, result);

        if (result.success) {
          alert(`✅ ${toolId}: ${result.data?.message || "Test successful"}`);
        } else {
          alert(`❌ ${toolId}: ${result.error || "Test failed"}`);
        }
      } catch (error) {
        console.error(`🧪 ${toolId} error:`, error);
        alert(`❌ ${toolId}: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-card card-container p-6">
        <div className="text-muted">
          {currentAgentId
            ? "Loading tools..."
            : "No agent selected. Create an agent first."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-card card-container p-6">
      {/* Header */}
      <div className="border-divider pb-4">
        <h2 className="heading-xl mb-2">Tools</h2>
        <p className="text-secondary text-sm">
          Select tools for your agent. {enabledCount} of {SUPPORT_TOOLS.length}{" "}
          tools enabled.
          {saving && <span className="text-blue-600 ml-2">Saving...</span>}
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUPPORT_TOOLS.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isEnabled={enabledTools[tool.id] || false}
            onToggle={handleToolToggle}
          />
        ))}
      </div>

      {/* Summary */}
      {enabledCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 card-container p-4">
          <h3 className="heading-sm text-blue-900 dark:text-blue-100 mb-2">
            Enabled Tools ({enabledCount})
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUPPORT_TOOLS.filter((tool) => enabledTools[tool.id]).map(
              (tool) => (
                <span
                  key={tool.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs rounded-full"
                >
                  {tool.icon} {tool.name}
                </span>
              )
            )}
          </div>

          {/* Test Tools Button */}
          {currentAgentId && (
            <button onClick={testTools} className="btn-primary btn-sm">
              🧪 Test Enabled Tools
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Tools;
