'use client';

import { useState } from 'react';
import { Crown, Heart, Briefcase } from 'lucide-react';
import PersonaConfig from './PersonaConfig';
import PersonaSelector from './PersonaSelector';
import PersonaDetails from './PersonaDetails';
import CustomDescription from './CustomDescription';
import AgentPreview from './AgentPreview';

const AIPersona = () => {
  const [selectedPersona, setSelectedPersona] = useState('classy');
  const [customDescription, setCustomDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [agentTitle, setAgentTitle] = useState('Customer Support TechCorp');
  const [maxCharacters, setMaxCharacters] = useState(500);
  const [defaultLanguage, setDefaultLanguage] = useState('en');

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
      description: 'Competent, reliable, and efficient. Uses clear, direct language focused on solutions. Perfect for business services, technical support, and corporate environments.',
      characteristics: [
        'Clear and direct communication',
        'Focuses on solutions and results',
        'Maintains efficiency and accuracy',
        'Demonstrates expertise and reliability',
        'Structured and organized approach'
      ],
      example: "Hello, I'm here to help resolve your issue efficiently. Let me gather some information to provide you with the best solution."
    }
  ];

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
        setAgentTitle={setAgentTitle}
        defaultLanguage={defaultLanguage}
        setDefaultLanguage={setDefaultLanguage}
        maxCharacters={maxCharacters}
        setMaxCharacters={setMaxCharacters}
      />

      {/* Persona Selection */}
      <PersonaSelector
        selectedPersona={selectedPersona}
        onPersonaSelect={handlePersonaSelect}
      />

      {/* Selected Persona Details */}
      <PersonaDetails selectedPersonaData={selectedPersonaData} />

      {/* Custom Description */}
      <CustomDescription
        customDescription={customDescription}
        setCustomDescription={setCustomDescription}
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
    </div>
  );
};

export default AIPersona;
