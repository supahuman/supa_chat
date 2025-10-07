'use client';

import { useState, useEffect } from 'react';
import { useAddKnowledgeItemMutation, useUploadKnowledgeFileMutation, useGetCompanyAgentQuery } from '@/store/botApi';
import KnowledgeTabs from './KnowledgeTabs';
import KnowledgeHeader from './KnowledgeHeader';
import KnowledgeForm from './KnowledgeForm';
import KnowledgeList from './KnowledgeList';
import KnowledgeSummary from './KnowledgeSummary';

const KnowledgeBase = ({ currentAgentId }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [textKnowledge, setTextKnowledge] = useState([]);
  const [links, setLinks] = useState([]);
  const [files, setFiles] = useState([]);
  const [qaPairs, setQaPairs] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // API mutations for adding knowledge items
  const [addKnowledgeItem, { isLoading: isSaving }] = useAddKnowledgeItemMutation();
  const [uploadKnowledgeFile, { isLoading: isUploading }] = useUploadKnowledgeFileMutation();

  // Load existing knowledge base data when currentAgentId changes
  const { data: agentResponse } = useGetCompanyAgentQuery(currentAgentId, {
    skip: !currentAgentId
  });

  useEffect(() => {
    if (currentAgentId && agentResponse?.success) {
      // Load agent data from API response
      const agent = agentResponse.data;
      console.log('Loading knowledge base for agent ID:', currentAgentId, agent.knowledgeBase);
      
      // Categorize knowledge base items by type
      const textItems = [];
      const linkItems = [];
      const fileItems = [];
      const qaItems = [];
      
      if (agent.knowledgeBase && Array.isArray(agent.knowledgeBase)) {
        agent.knowledgeBase.forEach(item => {
          switch (item.type) {
            case 'text':
              textItems.push(item);
              break;
            case 'url':
              linkItems.push(item);
              break;
            case 'file':
              fileItems.push(item);
              break;
            case 'qa':
              qaItems.push(item);
              break;
          }
        });
      }
      
      setTextKnowledge(textItems);
      setLinks(linkItems);
      setFiles(fileItems);
      setQaPairs(qaItems);
    } else if (!currentAgentId) {
      // Reset to empty state
      setTextKnowledge([]);
      setLinks([]);
      setFiles([]);
      setQaPairs([]);
    }
  }, [currentAgentId, agentResponse]);

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

  const handleSaveKnowledge = async () => {
    if (!currentAgentId) {
      console.log('❌ No agent ID available for saving knowledge');
      return;
    }

    try {
      // Handle file upload differently
      if (activeTab === 'files' && formData.file) {
        console.log('📁 Uploading file:', formData.file.name);
        
        const result = await uploadKnowledgeFile({
          agentId: currentAgentId,
          file: formData.file,
          title: formData.title || formData.file.name
        }).unwrap();

        console.log('✅ File uploaded successfully:', result);
        
        // Reset form and close
        setFormData({
          title: '',
          content: '',
          url: '',
          file: null,
          question: '',
          answer: ''
        });
        setIsAdding(false);
        return;
      }

      // Handle other knowledge types (text, links, qa)
      const typeMapping = {
        'text': 'text',
        'links': 'url',    // Map 'links' to 'url' for backend
        'files': 'file',
        'qa': 'qa'
      };

      const knowledgeData = {
        title: formData.title,
        type: typeMapping[activeTab] || activeTab
      };

      // Add type-specific data
      switch (activeTab) {
        case 'text':
          knowledgeData.content = formData.content;
          break;
        case 'links':
          knowledgeData.url = formData.url;
          break;
        case 'qa':
          knowledgeData.question = formData.question;
          knowledgeData.answer = formData.answer;
          break;
      }

      console.log('💾 Saving knowledge item:', knowledgeData);
      const result = await addKnowledgeItem({
        agentId: currentAgentId,
        ...knowledgeData
      }).unwrap();

      console.log('✅ Knowledge item saved:', result);
      
      // Update local state
      const newItem = {
        id: result.data.id,
        title: result.data.title,
        type: result.data.type,
        content: result.data.content,
        url: result.data.url,
        fileName: result.data.fileName,
        fileSize: result.data.fileSize,
        question: result.data.question,
        answer: result.data.answer,
        status: result.data.status,
        createdAt: result.data.createdAt
      };

      switch (activeTab) {
        case 'text':
          setTextKnowledge([...textKnowledge, newItem]);
          break;
        case 'links':
          setLinks([...links, newItem]);
          break;
        case 'files':
          setFiles([...files, newItem]);
          break;
        case 'qa':
          setQaPairs([...qaPairs, newItem]);
          break;
      }

    } catch (error) {
      console.error('❌ Error saving knowledge item:', error);
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
      <div className="border-divider pb-4">
        <h3 className="heading-lg">
          Knowledge Base
        </h3>
        <p className="text-sm text-secondary mt-1">
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
          isUploading={isUploading}
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
