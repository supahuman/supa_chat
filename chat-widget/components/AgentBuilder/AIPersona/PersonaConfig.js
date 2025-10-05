'use client';

const PersonaConfig = ({ 
  agentTitle, 
  setAgentTitle, 
  defaultLanguage, 
  setDefaultLanguage,
  maxCharacters,
  setMaxCharacters 
}) => {
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

  return (
    <>
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
    </>
  );
};

export default PersonaConfig;
