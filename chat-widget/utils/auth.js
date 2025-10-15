// Simple authentication utilities for development
// In production, this would integrate with your auth system

export const setCompanyCredentials = (companyApiKey, userId) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("companyApiKey", companyApiKey);
    localStorage.setItem("userId", userId);
  }
};

export const getCompanyCredentials = () => {
  if (typeof window !== "undefined") {
    return {
      companyApiKey: localStorage.getItem("companyApiKey"),
      userId: localStorage.getItem("userId"),
    };
  }
  return { companyApiKey: null, userId: null };
};

export const clearCompanyCredentials = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("companyApiKey");
    localStorage.removeItem("userId");
  }
};

export const hasValidCredentials = () => {
  const { companyApiKey, userId } = getCompanyCredentials();
  return !!(companyApiKey && userId);
};

// No mock credentials - require proper authentication
