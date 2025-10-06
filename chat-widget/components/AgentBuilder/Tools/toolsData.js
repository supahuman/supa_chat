// Tools data for customer support agents
export const SUPPORT_TOOLS = [
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Save to Cloud',
    icon: '📁',
    category: 'documentation',
    enabled: false
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send Message',
    icon: '💬',
    category: 'communication',
    enabled: false
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Send Message',
    icon: '📧',
    category: 'communication',
    enabled: false
  },
  {
    id: 'ticket',
    name: 'Ticket',
    description: 'Create Support',
    icon: '🎫',
    category: 'process',
    enabled: false
  },
  {
    id: 'callback',
    name: 'Callback',
    description: 'Schedule Call',
    icon: '📞',
    category: 'communication',
    enabled: false
  },
  {
    id: 'docs',
    name: 'Docs',
    description: 'Send Product',
    icon: '📚',
    category: 'documentation',
    enabled: false
  },
  {
    id: 'update',
    name: 'Update',
    description: 'Customer Record',
    icon: '👤',
    category: 'process',
    enabled: false
  },
  {
    id: 'refund',
    name: 'Refund',
    description: 'Request Process',
    icon: '💰',
    category: 'process',
    enabled: false
  },
  {
    id: 'escalate',
    name: 'Escalate',
    description: 'Manager Transfer',
    icon: '⬆️',
    category: 'escalation',
    enabled: false
  },
  {
    id: 'survey',
    name: 'Survey',
    description: 'Send Feedback',
    icon: '⭐',
    category: 'feedback',
    enabled: false
  }
];

export const TOOL_CATEGORIES = {
  communication: 'Communication',
  documentation: 'Documentation',
  process: 'Process Management',
  escalation: 'Escalation',
  feedback: 'Feedback'
};
