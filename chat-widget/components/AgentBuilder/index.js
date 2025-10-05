'use client';

import { useState } from 'react';
import TopTabBar from './TopTabBar';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import Backdrop from './Backdrop';

const DashboardLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('build');
  const [activeSidebarItem, setActiveSidebarItem] = useState('ai-persona');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
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
          activeSidebarItem={activeSidebarItem}
          setActiveSidebarItem={setActiveSidebarItem}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onItemClick={handleSidebarItemClick}
        />

        {/* Main Content */}
        <ContentArea
          activeTab={activeTab}
          activeSidebarItem={activeSidebarItem}
          agentData={agentData}
          setAgentData={setAgentData}
        >
          {children}
        </ContentArea>
      </div>
    </div>
  );
};

export default DashboardLayout;
