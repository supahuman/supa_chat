'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../../lib/authContext';
import { initializeGoogleAuth, renderGoogleButton } from '../../lib/googleAuth';

const GoogleSignupButton = ({ onSuccess }) => {
  const googleButtonRef = useRef(null);
  const { login } = useAuth();

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleAuth();
      if (googleButtonRef.current) {
        renderGoogleButton(googleButtonRef.current.id);
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Override the global callback to use our auth context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.handleGoogleSignInSuccess = (userData, token) => {
        login(userData, token);
        if (onSuccess) {
          onSuccess(userData);
        }
      };
    }
  }, [login, onSuccess]);

  return (
    <div className="w-full">
      <div 
        ref={googleButtonRef}
        id="google-signup-button"
        className="w-full"
      />
    </div>
  );
};

export default GoogleSignupButton;
