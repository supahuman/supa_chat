'use client';

import { Plus } from 'lucide-react';

const KnowledgeHeader = ({ 
  activeTab, 
  dataLength, 
  onAddKnowledge 
}) => {
  const getTabLabel = () => {
    const labels = {
      text: 'Text Knowledge',
      links: 'Website Links',
      files: 'File Uploads',
      qa: 'Q&A Pairs'
    };
    return labels[activeTab] || 'Knowledge';
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white">
          {getTabLabel()}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {dataLength} items added
        </p>
      </div>
      <button
        onClick={onAddKnowledge}
        className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
      >
        <Plus className="w-4 h-4" />
        <span>Add {getTabLabel()}</span>
      </button>
    </div>
  );
};

export default KnowledgeHeader;
