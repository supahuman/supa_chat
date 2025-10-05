'use client';

import { Users, MessageCircle, Clock, CheckCircle } from 'lucide-react';

const AgentStats = ({ agents, pendingEscalations }) => {
  const totalActiveChats = agents.reduce((sum, agent) => sum + agent.currentChats, 0);

  return (
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
              {totalActiveChats}
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
  );
};

export default AgentStats;
