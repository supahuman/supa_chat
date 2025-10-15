"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/ui";
import { Card } from "@/ui";
import {
  useGetCompanyAgentQuery,
  useUpdateCompanyAgentMutation,
} from "@/store/botApi";
import { hasValidCredentials } from "@/utils/auth";
import PersonaConfig from "./PersonaConfig";
import PersonaSelector from "./PersonaSelector";
import PersonaDetails from "./PersonaDetails";
import CustomDescription from "./CustomDescription";
import AgentPreview from "./AgentPreview";

const AgentEditor = ({ agentId }) => {
  const router = useRouter();
  const [agentData, setAgentData] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState("classy");
  const [customDescription, setCustomDescription] = useState("");
  const [agentTitle, setAgentTitle] = useState("");
  const [industry, setIndustry] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Set up mock credentials if none exist
  useEffect(() => {
    if (!hasValidCredentials()) {
      // No mock credentials - require proper authentication
    }
  }, []);

  // Fetch agent data
  const {
    data: agentResponse,
    isLoading,
    error,
  } = useGetCompanyAgentQuery(agentId, {
    skip: !agentId,
  });

  const [updateAgent] = useUpdateCompanyAgentMutation();

  // Load agent data when response is available
  useEffect(() => {
    if (agentResponse?.success && agentResponse.data) {
      const agent = agentResponse.data;
      setAgentData(agent);
      setAgentTitle(agent.name || "");
      setCustomDescription(agent.description || "");
      setIndustry(agent.industry || "general");

      // Set personality based on agent data
      if (agent.personality) {
        const matchingPersona = personas.find((p) =>
          agent.personality.includes(p.description.substring(0, 50))
        );
        if (matchingPersona) {
          setSelectedPersona(matchingPersona.id);
        }
      }
    }
  }, [agentResponse]);

  // Define personas array
  const personas = [
    {
      id: "classy",
      name: "Classy",
      description:
        "Sophisticated, elegant, and refined. Uses formal language with a touch of warmth. Perfect for luxury brands, professional services, and high-end customer experiences.",
      characteristics: [
        "Formal yet approachable tone",
        "Uses sophisticated vocabulary",
        "Maintains professional boundaries",
        "Demonstrates expertise and knowledge",
        "Polished and refined communication style",
      ],
      example:
        "Good day! I'm delighted to assist you with your inquiry. How may I provide you with the most exceptional service today?",
    },
    {
      id: "friendly",
      name: "Friendly",
      description:
        "Warm, approachable, and personable. Uses conversational language with genuine care. Perfect for community-focused brands, customer support, and personal services.",
      characteristics: [
        "Warm and welcoming tone",
        "Uses conversational language",
        "Shows genuine care and empathy",
        "Encourages open communication",
        "Makes customers feel valued",
      ],
      example:
        "Hi there! I'm so happy to help you today. What can I do to make your experience better? I'm here to support you every step of the way!",
    },
    {
      id: "professional",
      name: "Professional",
      description:
        "Efficient, knowledgeable, and results-oriented. Uses clear, direct language focused on solutions. Perfect for B2B services, technical support, and business applications.",
      characteristics: [
        "Clear and direct communication",
        "Focuses on solutions and results",
        "Demonstrates technical expertise",
        "Maintains business-appropriate tone",
        "Efficient and goal-oriented",
      ],
      example:
        "Hello! I'm here to help you resolve this issue efficiently. Let me gather some information and provide you with the best solution.",
    },
  ];

  const handleSave = async () => {
    if (!agentData) return;

    setIsSaving(true);
    try {
      const selectedPersonaData = personas.find(
        (p) => p.id === selectedPersona
      );

      const updatedData = {
        ...agentData,
        name: agentTitle,
        description: customDescription,
        industry: industry,
        personality: selectedPersonaData?.description || agentData.personality,
      };

      const result = await updateAgent({
        agentId: agentData.agentId,
        ...updatedData,
      }).unwrap();

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setAgentData(result.data);
      }
    } catch (error) {
      console.error("Error updating agent:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/agent-builder");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (error || !agentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Error loading agent
          </p>
          <Button onClick={handleBack} variant="outline">
            Back to Agent Builder
          </Button>
        </div>
      </div>
    );
  }

  const selectedPersonaData = personas.find((p) => p.id === selectedPersona);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Agent: {agentData.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Agent ID: {agentData.agentId}
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            variant="primary"
            size="lg"
            icon={isSaving ? Loader2 : Save}
            loading={isSaving}
            disabled={!agentTitle?.trim() || saved}
          >
            {saved ? "Saved!" : isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Agent Configuration */}
          <PersonaConfig
            agentTitle={agentTitle}
            setAgentTitle={setAgentTitle}
            industry={industry}
            setIndustry={setIndustry}
          />

          {/* Persona Selection */}
          <PersonaSelector
            selectedPersona={selectedPersona}
            onPersonaSelect={setSelectedPersona}
          />

          {/* Selected Persona Details */}
          <PersonaDetails selectedPersonaData={selectedPersonaData} />

          {/* Custom Description */}
          <CustomDescription
            customDescription={customDescription}
            setCustomDescription={setCustomDescription}
          />

          {/* Preview */}
          <AgentPreview
            selectedPersonaData={selectedPersonaData}
            agentTitle={agentTitle}
            customDescription={customDescription}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentEditor;
