'use client';

import { useState, useEffect } from 'react';
import TopTabBar from './TopTabBar';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import Backdrop from './Backdrop';

const DashboardLayout = ({ children }) => {
  // Initialize state with localStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agentBuilder_activeTab') || 'build';
    }
    return 'build';
  });
  
  const [activeSidebarItem, setActiveSidebarItem] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agentBuilder_activeSidebarItem') || 'ai-persona';
    }
    return 'ai-persona';
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [currentAgentId, setCurrentAgentId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agentBuilder_currentAgentId') || null;
    }
    return null;
  });

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Persist state to localStorage when values change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentBuilder_activeTab', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentBuilder_activeSidebarItem', activeSidebarItem);
    }
  }, [activeSidebarItem]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentAgentId) {
        localStorage.setItem('agentBuilder_currentAgentId', currentAgentId);
      } else {
        localStorage.removeItem('agentBuilder_currentAgentId');
      }
    }
  }, [currentAgentId]);

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
