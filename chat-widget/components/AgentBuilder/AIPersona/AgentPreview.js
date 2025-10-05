'use client';

const AgentPreview = ({ 
  selectedPersonaData, 
  agentTitle, 
  defaultLanguage, 
  maxCharacters, 
  customDescription 
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

  if (!selectedPersonaData) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
      <h4 className="heading-lg text-blue-900 dark:text-blue-100 mb-3">
        Agent Preview
      </h4>
      <div className="bg-card rounded-md p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <selectedPersonaData.icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-primary">{agentTitle}</p>
            <p className="text-sm text-muted">
              {selectedPersonaData.name} • {languages.find(l => l.code === defaultLanguage)?.name} • Max: {maxCharacters} chars
            </p>
          </div>
        </div>
        <p className="text-secondary text-sm mb-3">
          {customDescription || selectedPersonaData.description}
        </p>
        <div className="text-xs text-muted">
          <strong>Example:</strong> &ldquo;{selectedPersonaData.example}&rdquo;
        </div>
      </div>
    </div>
  );
};

export default AgentPreview;
