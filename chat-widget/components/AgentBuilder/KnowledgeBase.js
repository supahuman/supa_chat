'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Link, 
  Upload, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  File,
  Download
} from 'lucide-react';

const KnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [textKnowledge, setTextKnowledge] = useState([]);
  const [links, setLinks] = useState([]);
  const [files, setFiles] = useState([]);
  const [qaPairs, setQaPairs] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const tabs = [
    { id: 'text', label: 'Text Knowledge', icon: FileText, color: 'blue' },
    { id: 'links', label: 'Website Links', icon: Link, color: 'green' },
    { id: 'files', label: 'File Uploads', icon: Upload, color: 'purple' },
    { id: 'qa', label: 'Q&A Pairs', icon: MessageSquare, color: 'orange' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    url: '',
    file: null,
    question: '',
    answer: ''
  });

  const handleAddKnowledge = () => {
    setIsAdding(true);
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      url: '',
      file: null,
      question: '',
      answer: ''
    });
  };

  const handleSaveKnowledge = () => {
    const newItem = {
      id: Date.now().toString(),
      title: formData.title,
      createdAt: new Date().toISOString(),
      status: 'processing'
    };

    switch (activeTab) {
      case 'text':
        setTextKnowledge([...textKnowledge, { ...newItem, content: formData.content }]);
        break;
      case 'links':
        setLinks([...links, { ...newItem, url: formData.url }]);
        break;
      case 'files':
        setFiles([...files, { ...newItem, fileName: formData.file?.name, fileSize: formData.file?.size }]);
        break;
      case 'qa':
        setQaPairs([...qaPairs, { ...newItem, question: formData.question, answer: formData.answer }]);
        break;
    }

    setIsAdding(false);
    setFormData({
      title: '',
      content: '',
      url: '',
      file: null,
      question: '',
      answer: ''
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      url: '',
      file: null,
      question: '',
      answer: ''
    });
  };

  const handleDelete = (id) => {
    switch (activeTab) {
      case 'text':
        setTextKnowledge(textKnowledge.filter(item => item.id !== id));
        break;
      case 'links':
        setLinks(links.filter(item => item.id !== id));
        break;
      case 'files':
        setFiles(files.filter(item => item.id !== id));
        break;
      case 'qa':
        setQaPairs(qaPairs.filter(item => item.id !== id));
        break;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'text': return textKnowledge;
      case 'links': return links;
      case 'files': return files;
      case 'qa': return qaPairs;
      default: return [];
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Knowledge Base
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Add different types of knowledge to train your AI agent. Choose from text, websites, files, or Q&A pairs.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add Knowledge Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {getCurrentData().length} items added
          </p>
        </div>
        <button
          onClick={handleAddKnowledge}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add {tabs.find(tab => tab.id === activeTab)?.label}</span>
        </button>
      </div>

      {/* Add Knowledge Form */}
      {isAdding && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
          <h5 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Add New {tabs.find(tab => tab.id === activeTab)?.label}
          </h5>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a descriptive title..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Content based on active tab */}
            {activeTab === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the knowledge content that your AI agent should learn..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            )}

            {activeTab === 'links' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We'll crawl this website and extract relevant information for your agent.
                </p>
              </div>
            )}

            {activeTab === 'files' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.md"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Choose file
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supports PDF, DOC, DOCX, TXT, MD files
                  </p>
                  {formData.file && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="What question might users ask?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Answer
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="What should the AI agent respond with?"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                onClick={handleSaveKnowledge}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Items List */}
      <div className="space-y-3">
        {getCurrentData().length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon, { className: "w-8 h-8 text-gray-400 dark:text-gray-500" })}
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {tabs.find(tab => tab.id === activeTab)?.label} Added Yet
            </h4>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Click "Add {tabs.find(tab => tab.id === activeTab)?.label}" to start building your knowledge base.
            </p>
          </div>
        ) : (
          getCurrentData().map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{item.title}</h5>
                    {getStatusIcon(item.status)}
                  </div>
                  
                  {activeTab === 'text' && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
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
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item.fileName} ({formatFileSize(item.fileSize)})
                      </span>
                    </div>
                  )}
                  
                  {activeTab === 'qa' && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Q:</span> {item.question}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">A:</span> {item.answer}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 md:p-6">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Knowledge Base Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-300">{textKnowledge.length}</div>
            <div className="text-xs md:text-sm text-blue-700 dark:text-blue-200">Text Items</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-300">{links.length}</div>
            <div className="text-xs md:text-sm text-green-700 dark:text-green-200">Website Links</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-300">{files.length}</div>
            <div className="text-xs md:text-sm text-purple-700 dark:text-purple-200">Files</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-300">{qaPairs.length}</div>
            <div className="text-xs md:text-sm text-orange-700 dark:text-orange-200">Q&A Pairs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
