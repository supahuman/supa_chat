'use client';

const NameInputs = ({ firstName, lastName, onInputChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          value={firstName}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
          Last name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          value={lastName}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default NameInputs;
