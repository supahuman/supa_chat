'use client';

import { useState } from 'react';

const ToolCard = ({ tool, onToggle, isEnabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative bg-card border-card card-container p-4 cursor-pointer transition-all duration-200
        ${isEnabled ? 'border-blue-500 shadow-md' : 'hover:border-gray-300 dark:hover:border-gray-600'}
        ${isHovered ? 'shadow-lg' : 'shadow-sm'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onToggle(tool.id)}
    >
      {/* Tool Icon */}
      <div className="text-2xl mb-2">
        {tool.icon}
      </div>

      {/* Tool Name */}
      <h3 className="heading-sm mb-1">
        {tool.name}
      </h3>

      {/* Tool Description */}
      <p className="text-secondary text-xs mb-3 leading-tight">
        {tool.description}
      </p>

      {/* Enable Toggle */}
      <div className="flex justify-end">
        <button
          className={`
            relative inline-flex h-5 w-9 items-center rounded-full transition-colors
            ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'}
          `}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(tool.id);
          }}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEnabled ? 'translate-x-4' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>

      {/* Enabled indicator */}
      {isEnabled && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default ToolCard;
