"use client";

import { useEffect } from "react";

const AuthSetup = () => {
  useEffect(() => {
    // Check authentication status
    const hasRealAuth =
      localStorage.getItem("authToken") && localStorage.getItem("userId");

    if (hasRealAuth) {
      console.log("🔧 Real auth found");
    } else {
      console.log(
        "🔧 No authentication found - user needs to sign up or log in"
      );
    }
  }, []);

  return null; // This component doesn't render anything
};

export default AuthSetup;
