"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import GoogleSignupButton from "./GoogleSignupButton";
import FormDivider from "./FormDivider";
import NameInputs from "./NameInputs";
import EmailInput from "./EmailInput";
import PasswordInputs from "./PasswordInputs";
import TermsCheckbox from "./TermsCheckbox";
import AuthFooter from "./AuthFooter";

const Signup = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGoogleSignupSuccess = (userData) => {
    // User is already logged in via the auth context
    // Redirect to main page with pricing section for upgrade
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        login(result.user, result.token);
        // Store user ID for payment system
        localStorage.setItem("userId", result.user._id || result.user.id);
        // Redirect to main page with pricing section for upgrade
        router.push("/");
      } else {
        alert("Signup failed: " + result.error);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Miana</h1>
          <p className="text-gray-600">Start building your AI agents today</p>
        </div>

        {/* Google Signup Button */}
        <GoogleSignupButton onSuccess={handleGoogleSignupSuccess} />

        {/* Divider */}
        <FormDivider />

        {/* Signup Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <NameInputs
            firstName={formData.firstName}
            lastName={formData.lastName}
            onInputChange={handleInputChange}
          />

          <EmailInput
            email={formData.email}
            onInputChange={handleInputChange}
          />

          <PasswordInputs
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            onInputChange={handleInputChange}
          />

          <TermsCheckbox
            agreeToTerms={formData.agreeToTerms}
            onInputChange={handleInputChange}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Footer Links */}
        <AuthFooter />
      </div>
    </div>
  );
};

export default Signup;
