'use client';

import { useEffect } from 'react';
import { setupMockCredentials } from '@/utils/auth';

const AuthSetup = () => {
  useEffect(() => {
    // Set up mock credentials on app load
    setupMockCredentials();
  }, []);

  return null; // This component doesn't render anything
};

export default AuthSetup;
