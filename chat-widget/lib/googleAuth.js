// Google OAuth configuration and utilities

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const initializeGoogleAuth = () => {
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }
};


export const handleGoogleSignIn = async (response) => {
  try {
    // Decode the JWT token
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    const userData = {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      profilePicture: payload.picture,
      emailVerified: payload.email_verified
    };

    // Send to backend for user creation/login
    const result = await signupWithGoogle(userData);
    
    if (result.success) {
      // Redirect to dashboard or agent builder
      window.location.href = '/agent-builder';
    } else {
      console.error('Google signup failed:', result.error);
    }
  } catch (error) {
    console.error('Error processing Google signin:', error);
  }
};

export const signupWithGoogle = async (userData) => {
  try {
    const response = await fetch('/api/auth/google-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling Google signup API:', error);
    return { success: false, error: error.message };
  }
};

export const renderGoogleButton = (elementId) => {
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signup_with',
        shape: 'rectangular'
      }
    );
  }
};
