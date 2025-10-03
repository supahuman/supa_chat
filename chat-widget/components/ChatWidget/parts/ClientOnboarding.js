'use client';
import { useState } from 'react';
import { Plus, Database, Bot, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useCreateClientMutation } from '../../../store/botApi';

export default function ClientOnboarding({ isOpen, onClose, onClientCreated }) {
  const [createClient, { isLoading, error }] = useCreateClientMutation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    description: '',
    vectorDB: {
      type: '',
      connectionString: '',
      database: '',
      collection: '',
      vectorIndex: ''
    },
    llm: {
      provider: '',
      model: '',
      temperature: 0.7,
      maxTokens: 1000
    },
    apiKey: ''
  });
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const config = {
        clientId: formData.clientId,
        config: {
          name: formData.name,
          description: formData.description,
          vectorDB: {
            type: formData.vectorDB.type,
            connectionString: formData.vectorDB.connectionString,
            database: formData.vectorDB.database,
            collection: formData.vectorDB.collection,
            vectorIndex: formData.vectorDB.vectorIndex
          },
          llm: {
            provider: formData.llm.provider,
            model: formData.llm.model,
            temperature: formData.llm.temperature,
            maxTokens: formData.llm.maxTokens
          },
          [`${formData.llm.provider}ApiKey`]: formData.apiKey
        }
      };

      const result = await createClient(config).unwrap();
      
      if (result.success) {
        setSuccess(true);
        if (onClientCreated) {
          onClientCreated(result.clientId);
        }
      }
    } catch (err) {
      console.error('Error creating client:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      name: '',
      description: '',
      vectorDB: {
        type: '',
        connectionString: '',
        database: '',
        collection: '',
        vectorIndex: ''
      },
      llm: {
        provider: '',
        model: '',
        temperature: 0.7,
        maxTokens: 1000
      },
      apiKey: ''
    });
    setStep(1);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Client Created Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your client <strong>{formData.clientId}</strong> has been configured and is ready to use.
            </p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <h3 className="font-semibold">Add New Client</h3>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-4">
            <StepIndicator step={1} currentStep={step} label="Basic Info" />
            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            <StepIndicator step={2} currentStep={step} label="Database" />
            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            <StepIndicator step={3} currentStep={step} label="LLM" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[50vh]">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 dark:text-red-200 text-sm">
                  {error?.data?.error || error?.message || 'Failed to create client'}
                </span>
              </div>
            </div>
          )}

          {step === 1 && (
            <BasicInfoStep formData={formData} onInputChange={handleInputChange} />
          )}

          {step === 2 && (
            <DatabaseStep formData={formData} onInputChange={handleInputChange} />
          )}

          {step === 3 && (
            <LLMStep formData={formData} onInputChange={handleInputChange} />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <div className="flex justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create Client</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step, currentStep, label }) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  
  return (
    <div className="flex flex-col items-center space-y-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        isCompleted 
          ? 'bg-green-600 text-white' 
          : isActive 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}>
        {isCompleted ? <CheckCircle className="w-4 h-4" /> : step}
      </div>
      <span className={`text-xs ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

function BasicInfoStep({ formData, onInputChange }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-gray-100">Basic Information</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Client ID *
        </label>
        <input
          type="text"
          value={formData.clientId}
          onChange={(e) => onInputChange('clientId', e.target.value)}
          placeholder="e.g., mycompany, support-bot"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Company/Project Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="e.g., My Company Support"
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Brief description of your chatbot's purpose"
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        />
      </div>
    </div>
  );
}

function DatabaseStep({ formData, onInputChange }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-gray-100">Database Configuration</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Database Type *
        </label>
        <select
          value={formData.vectorDB.type}
          onChange={(e) => onInputChange('vectorDB.type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        >
          <option value="">Select database type</option>
          <option value="mongodb">MongoDB Atlas</option>
          <option value="supabase">Supabase</option>
        </select>
      </div>

      {formData.vectorDB.type === 'mongodb' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Connection String *
            </label>
            <input
              type="text"
              value={formData.vectorDB.connectionString}
              onChange={(e) => onInputChange('vectorDB.connectionString', e.target.value)}
              placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Database Name *
              </label>
              <input
                type="text"
                value={formData.vectorDB.database}
                onChange={(e) => onInputChange('vectorDB.database', e.target.value)}
                placeholder="e.g., mycompany_knowledge"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Collection Name *
              </label>
              <input
                type="text"
                value={formData.vectorDB.collection}
                onChange={(e) => onInputChange('vectorDB.collection', e.target.value)}
                placeholder="e.g., documents"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
        </>
      )}

      {formData.vectorDB.type === 'supabase' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase URL *
            </label>
            <input
              type="text"
              value={formData.vectorDB.connectionString}
              onChange={(e) => onInputChange('vectorDB.connectionString', e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Database Name *
            </label>
            <input
              type="text"
              value={formData.vectorDB.database}
              onChange={(e) => onInputChange('vectorDB.database', e.target.value)}
              placeholder="e.g., mycompany_knowledge"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>
        </>
      )}
    </div>
  );
}

function LLMStep({ formData, onInputChange }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-gray-100">LLM Configuration</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          LLM Provider *
        </label>
        <select
          value={formData.llm.provider}
          onChange={(e) => onInputChange('llm.provider', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        >
          <option value="">Select LLM provider</option>
          <option value="groq">Groq (Fast & Cost-effective)</option>
          <option value="openai">OpenAI (GPT models)</option>
          <option value="anthropic">Anthropic (Claude)</option>
        </select>
      </div>

      {formData.llm.provider && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model *
            </label>
            <select
              value={formData.llm.model}
              onChange={(e) => onInputChange('llm.model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            >
              <option value="">Select model</option>
              {formData.llm.provider === 'groq' && (
                <>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                  <option value="llama-3.1-70b-versatile">Llama 3.1 70B Versatile</option>
                </>
              )}
              {formData.llm.provider === 'openai' && (
                <>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </>
              )}
              {formData.llm.provider === 'anthropic' && (
                <>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key *
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => onInputChange('apiKey', e.target.value)}
              placeholder={`Enter your ${formData.llm.provider} API key`}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Temperature (0.0 - 1.0)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.llm.temperature}
                onChange={(e) => onInputChange('llm.temperature', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                min="100"
                max="4000"
                value={formData.llm.maxTokens}
                onChange={(e) => onInputChange('llm.maxTokens', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
