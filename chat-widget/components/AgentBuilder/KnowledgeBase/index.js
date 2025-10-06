'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useCrawlAgentUrlsMutation, useTestCrawlUrlMutation } from '@/store/botApi';
import KnowledgeTabs from './KnowledgeTabs';
import KnowledgeHeader from './KnowledgeHeader';
import KnowledgeForm from './KnowledgeForm';
import KnowledgeList from './KnowledgeList';
import KnowledgeSummary from './KnowledgeSummary';

const KnowledgeBase = forwardRef(({ agentData }, ref) => {
  const [activeTab, setActiveTab] = useState('text');
  const [textKnowledge, setTextKnowledge] = useState([]);
  const [links, setLinks] = useState([]);
  const [files, setFiles] = useState([]);
  const [qaPairs, setQaPairs] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCrawling, setIsCrawling] = useState(false);

  // RTK Query hooks for crawling
  const [crawlAgentUrls] = useCrawlAgentUrlsMutation();
  const [testCrawlUrl] = useTestCrawlUrlMutation();

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
    const newItem = {
      id: Date.now().toString(),
      title: formData.title,
      createdAt: new Date().toISOString(),
      status: 'saved'
    };

    switch (activeTab) {
      case 'text':
        const newTextItem = { ...newItem, content: formData.content };
        setTextKnowledge([...textKnowledge, newTextItem]);
        // Update agentData with new knowledge
        if (agentData?.setAgentData) {
          agentData.setAgentData(prev => ({
            ...prev,
            knowledgeBase: [...(prev.knowledgeBase || []), newTextItem]
          }));
        }
        break;
      case 'links':
        const newLinkItem = { ...newItem, url: formData.url, status: 'saved' };
        setLinks([...links, newLinkItem]);
        // Update agentData with new knowledge
        if (agentData?.setAgentData) {
          agentData.setAgentData(prev => ({
            ...prev,
            knowledgeBase: [...(prev.knowledgeBase || []), newLinkItem]
          }));
        }
        break;
      case 'files':
        const newFileItem = { ...newItem, fileName: formData.file?.name, fileSize: formData.file?.size };
        setFiles([...files, newFileItem]);
        // Update agentData with new knowledge
        if (agentData?.setAgentData) {
          agentData.setAgentData(prev => ({
            ...prev,
            knowledgeBase: [...(prev.knowledgeBase || []), newFileItem]
          }));
        }
        break;
      case 'qa':
        const newQAItem = { ...newItem, question: formData.question, answer: formData.answer };
        setQaPairs([...qaPairs, newQAItem]);
        // Update agentData with new knowledge
        if (agentData?.setAgentData) {
          agentData.setAgentData(prev => ({
            ...prev,
            knowledgeBase: [...(prev.knowledgeBase || []), newQAItem]
          }));
        }
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

  // Function to crawl all saved URLs after agent is created
  const crawlAllUrls = async (agentId) => {
    const urlsToCrawl = links.filter(link => link.status === 'saved' && link.url);
    
    if (urlsToCrawl.length === 0) {
      console.log('📝 No URLs to crawl');
      return;
    }

    try {
      setIsCrawling(true);
      console.log(`🕷️ Starting crawl for ${urlsToCrawl.length} URLs for agent ${agentId}`);

      const urls = urlsToCrawl.map(link => link.url);
      
      const result = await crawlAgentUrls({
        agentId: agentId,
        urls: urls
      }).unwrap();

      if (result.success) {
        console.log(`✅ Successfully crawled ${result.data.crawledCount} pages`);
        // Update all link statuses to completed
        setLinks(prev => prev.map(link => 
          urls.includes(link.url) ? { ...link, status: 'completed' } : link
        ));
      } else {
        console.error('❌ Crawling failed:', result.message);
        // Update all link statuses to failed
        setLinks(prev => prev.map(link => 
          urls.includes(link.url) ? { ...link, status: 'failed' } : link
        ));
      }
    } catch (error) {
      console.error('❌ Error crawling URLs:', error.message || error);
      // Update all link statuses to failed
      setLinks(prev => prev.map(link => 
        urlsToCrawl.some(urlLink => urlLink.url === link.url) ? { ...link, status: 'failed' } : link
      ));
    } finally {
      setIsCrawling(false);
    }
  };

  // Expose crawlAllUrls function to parent component
  useImperativeHandle(ref, () => ({
    crawlAllUrls
  }));

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
          isCrawling={isCrawling}
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
});

KnowledgeBase.displayName = 'KnowledgeBase';

export default KnowledgeBase;
