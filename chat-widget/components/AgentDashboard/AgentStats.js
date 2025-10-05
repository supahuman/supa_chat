'use client';

import { Users, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { StatsCard } from '@/ui';

const AgentStats = ({ agents, pendingEscalations }) => {
  const totalActiveChats = agents.reduce((sum, agent) => sum + agent.currentChats, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard
        icon={Users}
        title="Total Agents"
        value={agents.length}
        color="blue"
      />
      
      <StatsCard
        icon={MessageCircle}
        title="Active Chats"
        value={totalActiveChats}
        color="green"
      />
      
      <StatsCard
        icon={Clock}
        title="Pending"
        value={pendingEscalations.length}
        color="yellow"
      />
      
      <StatsCard
        icon={CheckCircle}
        title="Resolved Today"
        value="12"
        color="purple"
      />
    </div>
  );
};

export default AgentStats;
