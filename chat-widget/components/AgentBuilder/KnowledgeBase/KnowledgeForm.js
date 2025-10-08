'use client';

import { useState } from 'react';
import { Save, X, Upload } from 'lucide-react';

const KnowledgeForm = ({ 
  activeTab, 
  formData, 
  setFormData, 
  onSave, 
  onCancel,
  isCrawling = false,
  isUploading = false
}) => {
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

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
      <h5 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-4">
        Add New {getTabLabel()}
      </h5>
      
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter a descriptive title..."
            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[40px]"
          />
        </div>

        {/* Content based on active tab */}
        {activeTab === 'text' && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter the knowledge content that your AI agent should learn..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none min-h-[100px]"
            />
          </div>
        )}

        {activeTab === 'links' && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[40px]"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We'll crawl this website and extract relevant information for your agent after you save the agent.
            </p>
            {isCrawling && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                  Crawling website...
                </p>
              </div>
            )}
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
                <div className="mt-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                  {isUploading && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                        Processing file...
                      </div>
                    </div>
                  )}
                </div>
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
            onClick={onSave}
            disabled={isCrawling || isUploading}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>
              {isCrawling ? 'Crawling...' : 
               isUploading ? 'Uploading...' : 
               'Save'}
            </span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeForm;
