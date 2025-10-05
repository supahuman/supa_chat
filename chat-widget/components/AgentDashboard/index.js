'use client';

import { useState, useEffect } from 'react';
import AgentStats from './AgentStats';
import AgentList from './AgentList';
import EscalationList from './EscalationList';
import ChatModal from './ChatModal';

const AgentDashboard = ({ clientId }) => {
  const [agents, setAgents] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for now - replace with actual API calls
  useEffect(() => {
    // Simulate loading agents and escalations
    setAgents([
      {
        id: 'agent_1',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        status: 'online',
        currentChats: 2,
        maxConcurrentChats: 5,
        skills: ['Technical Support', 'Billing', 'General']
      },
      {
        id: 'agent_2',
        name: 'Mike Chen',
        email: 'mike@company.com',
        status: 'busy',
        currentChats: 4,
        maxConcurrentChats: 5,
        skills: ['Technical Support', 'Sales']
      },
      {
        id: 'agent_3',
        name: 'Emily Davis',
        email: 'emily@company.com',
        status: 'offline',
        currentChats: 0,
        maxConcurrentChats: 3,
        skills: ['Billing', 'General']
      }
    ]);

    setEscalations([
      {
        id: 'esc_1',
        clientId: 'supa-chat',
        sessionId: 'session_123',
        reason: 'Customer requested human assistance',
        priority: 'high',
        status: 'assigned',
        assignedAgent: 'agent_1',
        messages: [
          { content: 'I need help with my account', sender: 'customer', senderType: 'customer', timestamp: '2024-01-15T10:30:00Z' },
          { content: 'I can help you with that. What seems to be the issue?', sender: 'Sarah Johnson', senderType: 'agent', timestamp: '2024-01-15T10:31:00Z' }
        ],
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'esc_2',
        clientId: 'supa-chat',
        sessionId: 'session_456',
        reason: 'Complex technical issue',
        priority: 'medium',
        status: 'pending',
        assignedAgent: null,
        messages: [
          { content: 'My app keeps crashing when I try to upload files', sender: 'customer', senderType: 'customer', timestamp: '2024-01-15T10:35:00Z' }
        ],
        createdAt: '2024-01-15T10:35:00Z'
      }
    ]);
  }, [clientId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedEscalation) return;

    // Add message to escalation
    const updatedEscalations = escalations.map(esc => {
      if (esc.id === selectedEscalation.id) {
        return {
          ...esc,
          messages: [
            ...esc.messages,
            {
              content: newMessage,
              sender: 'You',
              senderType: 'agent',
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return esc;
    });

    setEscalations(updatedEscalations);
    setNewMessage('');
  };

  const handleAssignEscalation = (escalationId, agentId) => {
    const updatedEscalations = escalations.map(esc => {
      if (esc.id === escalationId) {
        return {
          ...esc,
          assignedAgent: agentId,
          status: 'assigned'
        };
      }
      return esc;
    });

    setEscalations(updatedEscalations);
  };

  const handleUpdateEscalationStatus = (escalationId, status) => {
    const updatedEscalations = escalations.map(esc => {
      if (esc.id === escalationId) {
        return {
          ...esc,
          status
        };
      }
      return esc;
    });

    setEscalations(updatedEscalations);
  };

  const pendingEscalations = escalations.filter(e => e.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage escalations and human agent interactions</p>
        </div>

        {/* Stats Cards */}
        <AgentStats agents={agents} pendingEscalations={pendingEscalations} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agents List */}
          <div className="lg:col-span-1">
            <AgentList agents={agents} />
          </div>

          {/* Escalations */}
          <div className="lg:col-span-2">
            <EscalationList
              escalations={escalations}
              agents={agents}
              onAssignEscalation={handleAssignEscalation}
              onUpdateEscalationStatus={handleUpdateEscalationStatus}
              onSelectEscalation={setSelectedEscalation}
            />
          </div>
        </div>

        {/* Chat Modal */}
        <ChatModal
          selectedEscalation={selectedEscalation}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onClose={() => setSelectedEscalation(null)}
        />
      </div>
    </div>
  );
};

export default AgentDashboard;
