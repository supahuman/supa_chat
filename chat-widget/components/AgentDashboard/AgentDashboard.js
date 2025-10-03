'use client';
import { useState, useEffect } from 'react';
import { Users, MessageCircle, Clock, CheckCircle, AlertCircle, UserPlus, Settings, Bell } from 'lucide-react';

export default function AgentDashboard({ clientId }) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'away': return 'text-orange-600 bg-orange-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
  const assignedEscalations = escalations.filter(e => e.status === 'assigned' || e.status === 'in_progress');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage escalations and human agent interactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {agents.reduce((sum, agent) => sum + agent.currentChats, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingEscalations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agents List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agents</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{agent.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {agent.currentChats}/{agent.maxConcurrentChats} chats
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Escalations */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Escalations</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {escalations.map((escalation) => (
                    <div key={escalation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(escalation.priority)}`}>
                            {escalation.priority}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            escalation.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                            escalation.status === 'assigned' ? 'text-blue-600 bg-blue-100' :
                            escalation.status === 'in_progress' ? 'text-orange-600 bg-orange-100' :
                            'text-green-600 bg-green-100'
                          }`}>
                            {escalation.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {escalation.status === 'pending' && (
                            <button
                              onClick={() => handleAssignEscalation(escalation.id, agents[0]?.id)}
                              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                            >
                              Assign
                            </button>
                          )}
                          {escalation.status === 'assigned' && (
                            <button
                              onClick={() => handleUpdateEscalationStatus(escalation.id, 'in_progress')}
                              className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                            >
                              Start
                            </button>
                          )}
                          {escalation.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateEscalationStatus(escalation.id, 'resolved')}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedEscalation(escalation)}
                            className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                          >
                            Chat
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{escalation.reason}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Session: {escalation.sessionId} • {new Date(escalation.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Modal */}
        {selectedEscalation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-96 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Chat with {selectedEscalation.sessionId}
                </h3>
                <button
                  onClick={() => setSelectedEscalation(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {selectedEscalation.messages.map((message, index) => (
                    <div key={index} className={`flex ${message.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.senderType === 'agent' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {message.sender} • {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
