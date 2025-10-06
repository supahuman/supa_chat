// Simple authentication utilities for development
// In production, this would integrate with your auth system

export const setCompanyCredentials = (companyApiKey, userId) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('companyApiKey', companyApiKey);
    localStorage.setItem('userId', userId);
  }
};

export const getCompanyCredentials = () => {
  if (typeof window !== 'undefined') {
    return {
      companyApiKey: localStorage.getItem('companyApiKey'),
      userId: localStorage.getItem('userId')
    };
  }
  return { companyApiKey: null, userId: null };
};

export const clearCompanyCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('companyApiKey');
    localStorage.removeItem('userId');
  }
};

export const hasValidCredentials = () => {
  const { companyApiKey, userId } = getCompanyCredentials();
  return !!(companyApiKey && userId);
};

// Mock credentials for development
export const setupMockCredentials = () => {
  setCompanyCredentials('sk_mock_1234567890abcdef', 'user_mock_12345');
  console.log('🔧 Mock credentials set for development');
  console.log('Company API Key: sk_mock_1234567890abcdef');
  console.log('User ID: user_mock_12345');
  
  // Also set them in localStorage directly for immediate use
  if (typeof window !== 'undefined') {
    localStorage.setItem('companyApiKey', 'sk_mock_1234567890abcdef');
    localStorage.setItem('userId', 'user_mock_12345');
  }
};
