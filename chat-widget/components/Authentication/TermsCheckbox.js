'use client';

import Link from 'next/link';

const TermsCheckbox = ({ agreeToTerms, onInputChange }) => {
  return (
    <div className="flex items-center">
      <input
        id="agreeToTerms"
        name="agreeToTerms"
        type="checkbox"
        required
        checked={agreeToTerms}
        onChange={onInputChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-blue-600 hover:text-blue-500">
          Terms
        </Link>
        .
      </label>
    </div>
  );
};

export default TermsCheckbox;
