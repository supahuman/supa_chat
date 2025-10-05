'use client';

import { Crown, Heart, Briefcase } from 'lucide-react';

const PersonaSelector = ({ selectedPersona, onPersonaSelect }) => {
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

  return (
    <>
      {/* Persona Selection Header */}
      <div className="mb-6">
        <h4 className="heading-lg">
          Choose Your AI Persona
        </h4>
        <p className="text-sm text-secondary mt-1">
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
              onClick={() => onPersonaSelect(persona.id)}
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
              <h4 className={`heading-md mb-2 ${
                isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-primary'
              }`}>
                {persona.name}
              </h4>

              {/* Description */}
              <p className="text-sm text-secondary mb-3">
                {persona.description}
              </p>

              {/* Example */}
              <div className="bg-surface rounded-md p-3">
                <p className="text-xs text-muted mb-1">Example:</p>
                <p className="text-sm text-secondary italic">
                  &ldquo;{persona.example}&rdquo;
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PersonaSelector;
