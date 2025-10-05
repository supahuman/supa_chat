'use client';

import { Edit3, Save, X, Plus } from 'lucide-react';
import { Button, Card } from '@/ui';

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
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h4 className="heading-lg">
          Custom Description
        </h4>
        {!isEditing && (
          <Button
            onClick={handleEditDescription}
            variant="ghost"
            size="sm"
            icon={Edit3}
          >
            {customDescription ? 'Edit' : 'Add Custom Description'}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            placeholder="Add specific instructions for your AI agent's personality, tone, or behavior. For example: 'Always use our company's signature phrases' or 'Be extra patient with elderly customers'..."
            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={handleSaveDescription}
              icon={Save}
              className="w-full sm:w-auto"
            >
              Save
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="secondary"
              icon={X}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="min-h-[100px]">
          {customDescription ? (
            <div className="bg-surface rounded-md p-4">
              <p className="text-secondary whitespace-pre-wrap">
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
                <p className="text-sm text-muted">
                  Click to add custom description
                </p>
              </div>
            </button>
          )}
        </div>
      )}
    </Card>
  );
};

export default CustomDescription;
