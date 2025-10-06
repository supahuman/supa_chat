/**
 * Global Model Configuration
 * 
 * This is the single source of truth for which LLM model
 * all clients will use. We control this centrally.
 */

export const GLOBAL_MODEL = {
  provider: "groq",
  model: "llama-3.1-8b-instant",
  temperature: 0.7,
  maxTokens: 200, // Reduced from 1000 to 200 for shorter responses
  // Additional model settings
  topP: 1,
  stream: false
};

/**
 * Get the current global model configuration
 * @returns {Object} Global model configuration
 */
export function getGlobalModel() {
  return { ...GLOBAL_MODEL };
}

/**
 * Update the global model (for when we want to change models)
 * @param {Object} newModelConfig - New model configuration
 */
export function updateGlobalModel(newModelConfig) {
  Object.assign(GLOBAL_MODEL, newModelConfig);
  console.log('🔄 Global model updated:', GLOBAL_MODEL);
}

/**
 * Get model info for display purposes
 * @returns {Object} Model display information
 */
export function getModelInfo() {
  const modelNames = {
    'llama-3.1-8b-instant': 'Llama 3.1 8B',
    'llama-3.1-70b-versatile': 'Llama 3.1 70B',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
    'claude-3-haiku-20240307': 'Claude 3 Haiku'
  };

  return {
    name: modelNames[GLOBAL_MODEL.model] || GLOBAL_MODEL.model,
    provider: GLOBAL_MODEL.provider,
    model: GLOBAL_MODEL.model,
    description: `All agents use ${modelNames[GLOBAL_MODEL.model] || GLOBAL_MODEL.model} for consistent, high-quality responses.`
  };
}
