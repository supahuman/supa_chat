'use client';

import { Trash2, CheckCircle, AlertCircle, ExternalLink, File } from 'lucide-react';

const KnowledgeList = ({ 
  activeTab, 
  data, 
  onDelete,
  isDeleting = false
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTabLabel = () => {
    const labels = {
      text: 'Text Knowledge',
      links: 'Website Links',
      files: 'File Uploads', 
      qa: 'Q&A Pairs'
    };
    return labels[activeTab] || 'Knowledge';
  };

  const getTabIcon = () => {
    const icons = {
      text: '📄',
      links: '🔗',
      files: '📁',
      qa: '❓'
    };
    return icons[activeTab] || '📄';
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{getTabIcon()}</span>
        </div>
        <h4 className="heading-lg mb-2">
          No {getTabLabel()} Added Yet
        </h4>
        <p className="text-secondary max-w-md mx-auto">
          Click &quot;Add {getTabLabel()}&quot; to start building your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.id} className="bg-card rounded-lg border-card p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h5 className="font-medium text-primary">{item.title}</h5>
                {getStatusIcon(item.status)}
              </div>
              
              {activeTab === 'text' && (
                <p className="text-sm text-secondary line-clamp-2">
                  {item.content}
                </p>
              )}
              
              {activeTab === 'links' && (
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 truncate"
                  >
                    {item.url}
                  </a>
                </div>
              )}
              
              {activeTab === 'files' && (
                <div className="flex items-center space-x-2">
                  <File className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-secondary">
                    {item.fileName} ({formatFileSize(item.fileSize)})
                  </span>
                </div>
              )}
              
              {activeTab === 'qa' && (
                <div className="space-y-1">
                  <p className="text-sm text-secondary">
                    <span className="font-medium">Q:</span> {item.question}
                  </p>
                  <p className="text-sm text-secondary">
                    <span className="font-medium">A:</span> {item.answer}
                  </p>
                </div>
              )}
              
              <p className="text-xs text-muted mt-2">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onDelete(item.id)}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KnowledgeList;
