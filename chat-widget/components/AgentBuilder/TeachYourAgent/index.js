'use client';

import { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import { useGetAgentsQuery } from '@/store/botApi';

const TeachYourAgent = ({ agentData, setAgentData }) => {
  const [currentChat, setCurrentChat] = useState([]);
  const [currentAgent, setCurrentAgent] = useState(null);
  
  // Get saved agents
  const { data: agentsData, isLoading: agentsLoading } = useGetAgentsQuery();
  
  // Find the most recent agent (or the one matching current agentData)
  useEffect(() => {
    if (agentsData?.success && agentsData.data?.length > 0) {
      // Find agent by name or get the most recent one
      const matchingAgent = agentsData.data.find(agent => 
        agent.name === agentData.name || 
        agent.personality === agentData.personality
      );
      setCurrentAgent(matchingAgent || agentsData.data[agentsData.data.length - 1]);
    }
  }, [agentsData, agentData]);

  return (
    <div className="h-[600px] flex flex-col">
      {/* Simple Chat Interface */}
      <ChatInterface
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
        currentAgent={currentAgent}
        agentData={agentData}
      />
    </div>
  );
};

export default TeachYourAgent;