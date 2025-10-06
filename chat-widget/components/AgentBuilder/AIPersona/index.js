'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Crown, Heart, Briefcase } from 'lucide-react';
import PersonaConfig from './PersonaConfig';
import PersonaSelector from './PersonaSelector';
import PersonaDetails from './PersonaDetails';
import CustomDescription from './CustomDescription';
import AgentPreview from './AgentPreview';
import AgentSaveButton from '../AgentSaveButton';
import { useGetCompanyAgentQuery } from '@/store/botApi';

const AIPersona = ({ currentAgentId, onAgentCreated }) => {
  // Local agent data state
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    personality: '',
    knowledgeBase: [],
    trainingExamples: []
  });
  
  const [selectedPersona, setSelectedPersona] = useState('classy');
  const [customDescription, setCustomDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [agentTitle, setAgentTitle] = useState('');
  const [maxCharacters, setMaxCharacters] = useState(500);
  const [defaultLanguage, setDefaultLanguage] = useState('en');

  // Load existing agent data when currentAgentId changes
  const { data: agentResponse, isLoading: isLoadingAgent } = useGetCompanyAgentQuery(currentAgentId, {
    skip: !currentAgentId
  });

  useEffect(() => {
    if (currentAgentId && agentResponse?.success) {
      // Load agent data from API response
      const agent = agentResponse.data;
      console.log('Loading agent data for ID:', currentAgentId, agent);
      
      setAgentData({
        name: agent.name || '',
        description: agent.description || '',
        personality: agent.personality || '',
        knowledgeBase: agent.knowledgeBase || [],
        trainingExamples: agent.trainingExamples || []
      });
      
      // Set form fields
      setAgentTitle(agent.name || '');
      setCustomDescription(agent.description || '');
      
      // Set personality based on agent data
      if (agent.personality) {
        const matchingPersona = personas.find(p => 
          agent.personality.includes(p.description.substring(0, 50))
        );
        if (matchingPersona) {
          setSelectedPersona(matchingPersona.id);
        }
      }
    } else if (!currentAgentId) {
      // Reset to new agent state
      setAgentData({
        name: '',
        description: '',
        personality: '',
        knowledgeBase: [],
        trainingExamples: []
      });
      setAgentTitle('');
      setCustomDescription('');
      setSelectedPersona('classy');
    }
  }, [currentAgentId, agentResponse]);

  // Update local state when agentData changes (for editing)
  useEffect(() => {
    if (agentData?.name) {
      setAgentTitle(agentData.name);
    }
    if (agentData?.description) {
      setCustomDescription(agentData.description);
    }
    if (agentData?.personality) {
      // Find matching persona based on personality text
      const matchingPersona = personas.find(p => 
        agentData.personality.includes(p.description.substring(0, 50))
      );
      if (matchingPersona) {
        setSelectedPersona(matchingPersona.id);
      }
    }
  }, [agentData]);

  // Define personas array
  const personas = [
    {
      id: 'classy',
      name: 'Classy',
      icon: Crown,
      description: 'Sophisticated, elegant, and refined. Uses formal language with a touch of warmth. Perfect for luxury brands, professional services, and high-end customer experiences.',
      characteristics: [
        'Formal yet approachable tone',
        'Uses sophisticated vocabulary',
        'Maintains professional boundaries',
        'Demonstrates expertise and knowledge',
        'Polished and refined communication style'
      ],
      example: "Good day! I'm delighted to assist you with your inquiry. How may I provide you with the most exceptional service today?"
    },
    {
      id: 'friendly',
      name: 'Friendly',
      icon: Heart,
      description: 'Warm, approachable, and personable. Uses conversational language with genuine care. Perfect for community-focused brands, customer support, and personal services.',
      characteristics: [
        'Warm and welcoming tone',
        'Uses conversational language',
        'Shows genuine care and empathy',
        'Encourages open communication',
        'Makes customers feel valued'
      ],
      example: "Hi there! I'm so happy to help you today. What can I do to make your experience better? I'm here to support you every step of the way!"
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Briefcase,
      description: 'Efficient, knowledgeable, and results-oriented. Uses clear, direct language focused on solutions. Perfect for B2B services, technical support, and business applications.',
      characteristics: [
        'Clear and direct communication',
        'Focuses on solutions and results',
        'Demonstrates technical expertise',
        'Maintains business-appropriate tone',
        'Efficient and goal-oriented'
      ],
      example: "Hello! I'm here to help you resolve this issue efficiently. Let me gather some information and provide you with the best solution."
    }
  ];

  // Update agent data when fields change
  const updateAgentData = useCallback((field, value) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setAgentData]);

  // Initialize agent data with default values
  useEffect(() => {
    // Set default personality if not set
    if (!agentData.personality) {
      const persona = personas.find(p => p.id === selectedPersona);
      if (persona) {
        updateAgentData('personality', persona.description);
      }
    }
  }, [selectedPersona, agentData.personality]);

  // Update agent data when local state changes
  useEffect(() => {
    if (agentTitle && agentTitle !== agentData.name) {
      console.log('🔄 Updating agent name:', agentTitle);
      updateAgentData('name', agentTitle);
    }
  }, [agentTitle, agentData.name]);

  useEffect(() => {
    if (customDescription && customDescription !== agentData.description) {
      console.log('🔄 Updating agent description:', customDescription);
      updateAgentData('description', customDescription);
    }
  }, [customDescription, agentData.description]);

  // Debug: Log agentData changes
  useEffect(() => {
    console.log('📊 AIPersona - agentData updated:', agentData);
  }, [agentData]);

  // Handle agent title change
  const handleTitleChange = (title) => {
    setAgentTitle(title);
    updateAgentData('name', title);
  };

  // Handle description change
  const handleDescriptionChange = (description) => {
    setCustomDescription(description);
    updateAgentData('description', description);
  };

  // Handle persona change
  const handlePersonaChange = (personaId) => {
    setSelectedPersona(personaId);
    const persona = personas.find(p => p.id === personaId);
    if (persona) {
      updateAgentData('personality', persona.description);
    }
  };


  const handlePersonaSelect = (personaId) => {
    setSelectedPersona(personaId);
  };

  const selectedPersonaData = personas.find(p => p.id === selectedPersona);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Configure Your AI Persona
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Set up your AI agent's identity, personality, and communication style.
        </p>
      </div>

      {/* Agent Configuration */}
      <PersonaConfig
        agentTitle={agentTitle}
        setAgentTitle={handleTitleChange}
        defaultLanguage={defaultLanguage}
        setDefaultLanguage={setDefaultLanguage}
        maxCharacters={maxCharacters}
        setMaxCharacters={setMaxCharacters}
      />

      {/* Persona Selection */}
      <PersonaSelector
        selectedPersona={selectedPersona}
        onPersonaSelect={handlePersonaChange}
      />

      {/* Selected Persona Details */}
      <PersonaDetails selectedPersonaData={selectedPersonaData} />

      {/* Custom Description */}
      <CustomDescription
        customDescription={customDescription}
        setCustomDescription={handleDescriptionChange}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        tempDescription={tempDescription}
        setTempDescription={setTempDescription}
      />

      {/* Preview */}
      <AgentPreview
        selectedPersonaData={selectedPersonaData}
        agentTitle={agentTitle}
        defaultLanguage={defaultLanguage}
        maxCharacters={maxCharacters}
        customDescription={customDescription}
      />

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-center">
          <AgentSaveButton 
            agentData={agentData}
            onSaveSuccess={(savedAgent) => {
              console.log('Agent saved successfully:', savedAgent);
              // Call the onAgentCreated callback with the agent ID
              if (onAgentCreated && savedAgent?.agentId) {
                onAgentCreated(savedAgent.agentId);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AIPersona;
