'use client';

const PersonaDetails = ({ selectedPersonaData }) => {
  if (!selectedPersonaData) return null;

  return (
    <div className="bg-surface rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <selectedPersonaData.icon className="w-4 h-4 text-white" />
        </div>
        <h4 className="heading-lg">
          {selectedPersonaData.name} Persona Selected
        </h4>
      </div>

      {/* Characteristics */}
      <div className="mb-4">
        <h5 className="heading-sm mb-2">
          Key Characteristics:
        </h5>
        <ul className="space-y-1">
          {selectedPersonaData.characteristics.map((characteristic, index) => (
            <li key={index} className="flex items-center space-x-2 text-sm text-secondary">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span>{characteristic}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PersonaDetails;
