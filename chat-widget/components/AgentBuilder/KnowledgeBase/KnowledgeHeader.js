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
        <h4 className="heading-md">
          {getTabLabel()}
        </h4>
        <p className="text-sm text-secondary">
          {dataLength} items added
        </p>
      </div>
      <button
        onClick={onAddKnowledge}
        className="btn-primary w-full sm:w-auto"
      >
        <Plus className="w-4 h-4 mr-2" />
        <span>Add {getTabLabel()}</span>
      </button>
    </div>
  );
};

export default KnowledgeHeader;
