'use client';

import { useState, useEffect, useRef } from 'react';
import TopTabBar from './TopTabBar';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import Backdrop from './Backdrop';

const DashboardLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('build');
  const [activeSidebarItem, setActiveSidebarItem] = useState('ai-persona');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentAreaRef = useRef();
  
  // Agent data collection
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    personality: '',
    knowledgeBase: [],
    trainingExamples: []
  });

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Set default sidebar item when switching tabs
  useEffect(() => {
    if (activeTab === 'deploy' && !['agents', 'embeds', 'settings', 'analytics'].includes(activeSidebarItem)) {
      setActiveSidebarItem('agents');
    } else if (activeTab === 'build' && !['ai-persona', 'knowledge-base', 'actions', 'forms', 'teach-agent'].includes(activeSidebarItem)) {
      setActiveSidebarItem('ai-persona');
    }
  }, [activeTab, activeSidebarItem]);

  const handleSidebarItemClick = (itemId) => {
    setActiveSidebarItem(itemId);
    
    // Auto-switch to Train tab for training-related items
    const trainingItems = ['knowledge-base', 'actions', 'forms', 'teach-agent'];
    if (trainingItems.includes(itemId)) {
      setActiveTab('train');
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Function to handle agent creation success and trigger crawling
  const handleAgentCreated = async (agentId) => {
    console.log(`🎉 Agent created with ID: ${agentId}`);
    
    // Trigger crawling of any saved URLs
    if (contentAreaRef.current) {
      try {
        await contentAreaRef.current.crawlAllUrls(agentId);
        console.log('✅ Crawling completed for new agent');
      } catch (error) {
        console.error('❌ Error crawling URLs for new agent:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile-style Top Tab Bar */}
      <TopTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Mobile backdrop overlay */}
      <Backdrop isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      <div className="flex h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          activeSidebarItem={activeSidebarItem}
          setActiveSidebarItem={setActiveSidebarItem}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onItemClick={handleSidebarItemClick}
        />

        {/* Main Content */}
        <ContentArea
          ref={contentAreaRef}
          activeTab={activeTab}
          activeSidebarItem={activeSidebarItem}
          agentData={agentData}
          setAgentData={setAgentData}
          onAgentCreated={handleAgentCreated}
        >
          {children}
        </ContentArea>
      </div>
    </div>
  );
};

export default DashboardLayout;
