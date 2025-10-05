'use client';

import { useState } from 'react';
import { Crown, Heart, Briefcase, Plus, Edit3, Save, X } from 'lucide-react';

const AIPersona = () => {
  const [selectedPersona, setSelectedPersona] = useState('classy');
  const [customDescription, setCustomDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [agentTitle, setAgentTitle] = useState('Customer Support TechCorp');
  const [maxCharacters, setMaxCharacters] = useState(500);
  const [defaultLanguage, setDefaultLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

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

  const handleEditDescription = () => {
    setTempDescription(customDescription);
    setIsEditing(true);
  };

  const handleSaveDescription = () => {
    setCustomDescription(tempDescription);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempDescription('');
    setIsEditing(false);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-6">
        {/* Agent Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Agent Title
          </label>
          <input
            type="text"
            value={agentTitle}
            onChange={(e) => setAgentTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g., Customer Support TechCorp"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This will be displayed as your agent's name/role
          </p>
        </div>

        {/* Default Language */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Default Language
          </label>
          <select
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Primary language for your AI agent
          </p>
        </div>
      </div>

      {/* Response Length Control */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Max Response Length
          </label>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
            {maxCharacters} characters
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={maxCharacters}
            onChange={(e) => setMaxCharacters(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Brief (100)</span>
            <span>Medium (500)</span>
            <span>Detailed (1000)</span>
            <span>Comprehensive (2000)</span>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {[100, 300, 500, 1000].map((chars) => (
            <button
              key={chars}
              onClick={() => setMaxCharacters(chars)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                maxCharacters === chars
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {chars} chars
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Controls token usage and response length. Lower limits = lower costs.
        </p>
      </div>

      {/* Persona Selection Header */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Choose Your AI Persona
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Select a base personality for your AI agent, then customize it to match your brand.
        </p>
      </div>

      {/* Persona Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => {
          const Icon = persona.icon;
          const isSelected = selectedPersona === persona.id;
          
          return (
            <div
              key={persona.id}
              onClick={() => handlePersonaSelect(persona.id)}
              className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                isSelected ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Icon className={`w-6 h-6 ${
                  isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`} />
              </div>

              {/* Name */}
              <h4 className={`text-lg font-semibold mb-2 ${
                isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-gray-900 dark:text-white'
              }`}>
                {persona.name}
              </h4>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {persona.description}
              </p>

              {/* Example */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Example:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{persona.example}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Persona Details */}
      {selectedPersonaData && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <selectedPersonaData.icon className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedPersonaData.name} Persona Selected
            </h4>
          </div>

          {/* Characteristics */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Key Characteristics:
            </h5>
            <ul className="space-y-1">
              {selectedPersonaData.characteristics.map((characteristic, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>{characteristic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Custom Description */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Custom Description
          </h4>
          {!isEditing && (
            <button
              onClick={handleEditDescription}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Edit3 className="w-4 h-4" />
              <span>{customDescription ? 'Edit' : 'Add Custom Description'}</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder="Add specific instructions for your AI agent's personality, tone, or behavior. For example: 'Always use our company's signature phrases' or 'Be extra patient with elderly customers'..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleSaveDescription}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-[100px]">
            {customDescription ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {customDescription}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                <div className="text-center">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click "Add Custom Description" to personalize your AI agent
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Agent Preview
        </h4>
        <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <selectedPersonaData.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{agentTitle}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedPersonaData.name} • {languages.find(l => l.code === defaultLanguage)?.name} • Max: {maxCharacters} chars
              </p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
            {customDescription || selectedPersonaData.description}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Example Response:</strong> "{selectedPersonaData.example}"
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPersona;
