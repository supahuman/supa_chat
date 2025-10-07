/**
 * Agent Configuration Data
 * Centralized data for agent builder forms
 */

export const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' }
];

export const industries = [
  { value: 'general', label: 'General' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'events', label: 'Events' },
  { value: 'education', label: 'Education' },
  { value: 'support', label: 'Support' },
  { value: 'technology', label: 'Technology' },
  { value: 'retail', label: 'Retail' },
  { value: 'hospitality', label: 'Hospitality' }
];

export const responseLengths = [
  { value: 100, label: 'Brief (100)' },
  { value: 300, label: 'Short (300)' },
  { value: 500, label: 'Medium (500)' },
  { value: 1000, label: 'Detailed (1000)' }
];

export const defaultAgentConfig = {
  language: 'en',
  industry: 'general',
  maxCharacters: 500
};
