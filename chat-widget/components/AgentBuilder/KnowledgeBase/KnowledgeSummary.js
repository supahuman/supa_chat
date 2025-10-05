'use client';

const KnowledgeSummary = ({ 
  textKnowledge, 
  links, 
  files, 
  qaPairs 
}) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 md:p-6">
      <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
        Knowledge Base Summary
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-300">
            {textKnowledge.length}
          </div>
          <div className="text-xs md:text-sm text-blue-700 dark:text-blue-200">
            Text Items
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-300">
            {links.length}
          </div>
          <div className="text-xs md:text-sm text-green-700 dark:text-green-200">
            Website Links
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-300">
            {files.length}
          </div>
          <div className="text-xs md:text-sm text-purple-700 dark:text-purple-200">
            Files
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-300">
            {qaPairs.length}
          </div>
          <div className="text-xs md:text-sm text-orange-700 dark:text-orange-200">
            Q&A Pairs
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeSummary;
