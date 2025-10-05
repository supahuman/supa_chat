'use client';

import { useState } from 'react';
import KnowledgeTabs from './KnowledgeTabs';
import KnowledgeHeader from './KnowledgeHeader';
import KnowledgeForm from './KnowledgeForm';
import KnowledgeList from './KnowledgeList';
import KnowledgeSummary from './KnowledgeSummary';

const KnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [textKnowledge, setTextKnowledge] = useState([]);
  const [links, setLinks] = useState([]);
  const [files, setFiles] = useState([]);
  const [qaPairs, setQaPairs] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
      <KnowledgeTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Header with Add Button */}
      <KnowledgeHeader 
        activeTab={activeTab}
        dataLength={getCurrentData().length}
        onAddKnowledge={handleAddKnowledge}
      />

      {/* Add Knowledge Form */}
      {isAdding && (
        <KnowledgeForm
          activeTab={activeTab}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveKnowledge}
          onCancel={handleCancel}
        />
      )}

      {/* Knowledge Items List */}
      <KnowledgeList
        activeTab={activeTab}
        data={getCurrentData()}
        onDelete={handleDelete}
      />

      {/* Summary */}
      <KnowledgeSummary
        textKnowledge={textKnowledge}
        links={links}
        files={files}
        qaPairs={qaPairs}
      />
    </div>
  );
};

export default KnowledgeBase;
