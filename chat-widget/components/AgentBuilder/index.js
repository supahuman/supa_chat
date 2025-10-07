'use client';

import { useState, useEffect } from 'react';
import TopTabBar from './TopTabBar';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import Backdrop from './Backdrop';

const DashboardLayout = ({ children }) => {
  // Initialize state with default values (same for server and client)
  const [activeTab, setActiveTab] = useState('build');
  const [activeSidebarItem, setActiveSidebarItem] = useState('ai-persona');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentAgentId, setCurrentAgentId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Load from localStorage after hydration to prevent SSR mismatch
  useEffect(() => {
    setIsHydrated(true);
    
    // Load persisted state from localStorage
    const savedActiveTab = localStorage.getItem('agentBuilder_activeTab');
    const savedActiveSidebarItem = localStorage.getItem('agentBuilder_activeSidebarItem');
    const savedCurrentAgentId = localStorage.getItem('agentBuilder_currentAgentId');
    
    if (savedActiveTab) setActiveTab(savedActiveTab);
    if (savedActiveSidebarItem) setActiveSidebarItem(savedActiveSidebarItem);
    if (savedCurrentAgentId) setCurrentAgentId(savedCurrentAgentId);
  }, []);

  // Persist state to localStorage when values change (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('agentBuilder_activeTab', activeTab);
    }
  }, [activeTab, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('agentBuilder_activeSidebarItem', activeSidebarItem);
    }
  }, [activeSidebarItem, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      if (currentAgentId) {
        localStorage.setItem('agentBuilder_currentAgentId', currentAgentId);
      } else {
        localStorage.removeItem('agentBuilder_currentAgentId');
      }
    }
  }, [currentAgentId, isHydrated]);

  // Set default sidebar item when switching tabs
  useEffect(() => {
    if (activeTab === 'deploy' && !['agents', 'embeds', 'settings', 'analytics'].includes(activeSidebarItem)) {
      setActiveSidebarItem('agents');
    } else if (activeTab === 'build' && !['ai-persona', 'knowledge-base', 'actions', 'forms', 'tools', 'teach-agent'].includes(activeSidebarItem)) {
      setActiveSidebarItem('ai-persona');
    }
  }, [activeTab, activeSidebarItem]);

  // Global keyboard shortcuts (desktop only)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only enable keyboard shortcuts on desktop (screen width >= 768px)
      if (window.innerWidth < 768) return;
      
      // Escape key to cancel forms or close modals
      if (e.key === 'Escape') {
        // Dispatch a custom event for escape actions
        window.dispatchEvent(new CustomEvent('agentBuilder:escape'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab, activeSidebarItem]);

  const handleSidebarItemClick = (itemId) => {
    setActiveSidebarItem(itemId);
    
    // Auto-switch to Train tab for training-related items
    const trainingItems = ['knowledge-base', 'actions', 'forms', 'tools', 'teach-agent'];
    if (trainingItems.includes(itemId)) {
      setActiveTab('train');
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Function to handle agent creation success
  const handleAgentCreated = async (agentId) => {
    console.log(`🎉 Agent created with ID: ${agentId}`);
    setCurrentAgentId(agentId);
    // Backend will handle NLP processing automatically
  };

  // Function to handle editing an existing agent
  const handleEditAgent = (agent) => {
    console.log('Editing agent:', agent);
    setCurrentAgentId(agent.agentId);
    
    // Switch to Build tab and AI Persona
    setActiveTab('build');
    setActiveSidebarItem('ai-persona');
  };

  // Show loading state until hydration is complete
  if (!isHydrated) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Top Tab Bar - replaces main nav */}
      <TopTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Mobile backdrop overlay */}
      <Backdrop isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      <div className="flex flex-1 overflow-hidden">
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
          activeTab={activeTab}
          activeSidebarItem={activeSidebarItem}
          currentAgentId={currentAgentId}
          onAgentCreated={handleAgentCreated}
          onEditAgent={handleEditAgent}
        >
          {children}
        </ContentArea>
      </div>
    </div>
  );
};

export default DashboardLayout;
