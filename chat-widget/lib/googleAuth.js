// Google OAuth configuration and utilities
import { checkBackendHealth } from "./backendHealth.js";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const initializeGoogleAuth = () => {
  if (typeof window !== "undefined" && window.google) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }
};

export const handleGoogleSignIn = async (response) => {
  try {
    // Decode the JWT token
    const payload = JSON.parse(atob(response.credential.split(".")[1]));

    const userData = {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      profilePicture: payload.picture,
      emailVerified: payload.email_verified,
    };

    // Send to backend for user creation/login
    const result = await signupWithGoogle(userData);

    if (result.success) {
      // Call the global success callback if it exists
      if (typeof window.handleGoogleSignInSuccess === "function") {
        window.handleGoogleSignInSuccess(result.user, result.token);
      } else {
        // Fallback: redirect to main page with pricing section
        window.location.href = "/";
      }
    } else {
      console.error("Google signup failed:", result.error);
      alert("Google signup failed: " + result.error);
    }
  } catch (error) {
    console.error("Error processing Google signin:", error);
    alert("Error processing Google signin: " + error.message);
  }
};

export const signupWithGoogle = async (userData) => {
  try {
    // Check backend health first
    const healthCheck = await checkBackendHealth();
    if (!healthCheck.healthy) {
      throw new Error(
        `Backend is not available: ${healthCheck.error}. Please ensure the backend server is running on port 4000.`
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:4000";
    console.log(
      "Calling backend Google signup API:",
      `${backendUrl}/api/auth/google-signup`
    );

    const response = await fetch(`${backendUrl}/api/auth/google-signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    if (result.success && result.token) {
      // Store the JWT token and user data in localStorage
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("userId", result.user._id || result.user.id);
      console.log("✅ User authenticated and token stored");
      console.log("✅ User ID stored:", result.user._id || result.user.id);
    }

    return result;
  } catch (error) {
    console.error("❌ Error calling backend Google signup API:", error);
    return { success: false, error: error.message };
  }
};

export const renderGoogleButton = (elementId) => {
  if (typeof window !== "undefined" && window.google) {
    window.google.accounts.id.renderButton(document.getElementById(elementId), {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "signup_with",
      shape: "rectangular",
    });
  }
};
