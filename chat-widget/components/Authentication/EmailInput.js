'use client';

const EmailInput = ({ email, onInputChange }) => {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
        Work email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        value={email}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

export default EmailInput;
