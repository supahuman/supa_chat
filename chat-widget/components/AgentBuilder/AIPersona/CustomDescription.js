'use client';

import { Edit3, Save, X, Plus } from 'lucide-react';

const CustomDescription = ({ 
  customDescription, 
  setCustomDescription,
  isEditing,
  setIsEditing,
  tempDescription,
  setTempDescription 
}) => {
  const handleEditDescription = () => {
    setTempDescription(customDescription);
    setIsEditing(true);
  };

  const handleSaveDescription = () => {
    setCustomDescription(tempDescription);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempDescription('');
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Custom Description
        </h4>
        {!isEditing && (
          <button
            onClick={handleEditDescription}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            <span>{customDescription ? 'Edit' : 'Add Custom Description'}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            placeholder="Add specific instructions for your AI agent's personality, tone, or behavior. For example: 'Always use our company's signature phrases' or 'Be extra patient with elderly customers'..."
            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleSaveDescription}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-[100px]">
          {customDescription ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {customDescription}
              </p>
            </div>
          ) : (
            <button
              onClick={handleEditDescription}
              className="w-full flex items-center justify-center h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to add custom description
                </p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDescription;
