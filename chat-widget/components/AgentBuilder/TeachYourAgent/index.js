'use client';

import { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import { useGetCompanyAgentsQuery } from '@/store/botApi';

const TeachYourAgent = ({ currentAgentId }) => {
  const [currentChat, setCurrentChat] = useState([]);
  const [currentAgent, setCurrentAgent] = useState(null);
  
  // Get saved agents
  const { data: agentsData, isLoading: agentsLoading } = useGetCompanyAgentsQuery();
  
  // Load agent data when currentAgentId changes
  useEffect(() => {
    if (currentAgentId && agentsData?.data) {
      const agent = agentsData.data.find(a => a.agentId === currentAgentId);
      if (agent) {
        console.log('🎯 Using agent for chat:', agent);
        setCurrentAgent(agent);
      }
    } else {
      setCurrentAgent(null);
    }
  }, [currentAgentId, agentsData]);

  return (
    <div className="h-full flex flex-col">
      {/* Simple Chat Interface */}
      <ChatInterface
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
        currentAgent={currentAgent}
      />
    </div>
  );
};

export default TeachYourAgent;