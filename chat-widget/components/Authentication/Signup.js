'use client';

import { useState } from 'react';
import GoogleSignupButton from './GoogleSignupButton';
import FormDivider from './FormDivider';
import NameInputs from './NameInputs';
import EmailInput from './EmailInput';
import PasswordInputs from './PasswordInputs';
import TermsCheckbox from './TermsCheckbox';
import AuthFooter from './AuthFooter';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGoogleSignup = () => {
    // Handle Google signup logic here
    console.log('Google signup clicked');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup data:', formData);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Miana
          </h1>
          <p className="text-gray-600">
            Start building your AI agents today
          </p>
        </div>

        {/* Google Signup Button */}
        <GoogleSignupButton onClick={handleGoogleSignup} />

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
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Create Account
          </button>
        </form>

        {/* Footer Links */}
        <AuthFooter />
      </div>
    </div>
  );
};

export default Signup;
