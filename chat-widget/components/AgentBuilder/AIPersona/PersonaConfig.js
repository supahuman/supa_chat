'use client';

import { Input, Select, Button } from '@/ui';
import { languages, industries, responseLengths } from '@/utils/agentConfigData';

const PersonaConfig = ({ 
  agentTitle, 
  setAgentTitle, 
  defaultLanguage, 
  setDefaultLanguage,
  maxCharacters,
  setMaxCharacters,
  industry,
  setIndustry,
  onSave
}) => {
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger save when Enter is pressed in title field
      if (onSave) {
        onSave();
      }
    }
  };

  return (
    <>
      {/* Agent Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-6">
        {/* Agent Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Agent Title
          </label>
          <Input
            type="text"
            value={agentTitle}
            onChange={(e) => setAgentTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="e.g., Customer Support TechCorp"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This will be displayed as your agent&apos;s name/role
          </p>
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Industry
          </label>
          <Select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            options={industries}
            placeholder="Select industry"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Helps provide industry-specific guidelines
          </p>
        </div>

        {/* Default Language */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Default Language
          </label>
          <Select
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            options={languages}
            placeholder="Select language"
          />
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
          {responseLengths.map((length) => (
            <Button
              key={length.value}
              onClick={() => setMaxCharacters(length.value)}
              variant={maxCharacters === length.value ? 'primary' : 'secondary'}
              size="xs"
            >
              {length.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Controls token usage and response length. Lower limits = lower costs.
        </p>
      </div>
    </>
  );
};

export default PersonaConfig;
