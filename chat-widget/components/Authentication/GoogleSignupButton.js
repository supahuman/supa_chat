'use client';

import { useEffect, useRef } from 'react';
import { initializeGoogleAuth, renderGoogleButton } from '../../lib/googleAuth';

const GoogleSignupButton = () => {
  const googleButtonRef = useRef(null);

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
