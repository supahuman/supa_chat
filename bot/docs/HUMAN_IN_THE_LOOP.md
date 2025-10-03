# Human-in-the-Loop (HITL) System

This document describes the human-in-the-loop functionality that allows seamless escalation from AI to human agents.

## Overview

The HITL system provides:
- **Automatic Escalation**: AI detects when human intervention is needed
- **Agent Management**: Manage human agents and their availability
- **Real-time Handoff**: Seamless transition from AI to human
- **Queue Management**: Handle multiple escalations efficiently
- **Agent Dashboard**: Monitor and manage escalations

## Architecture

```
Customer Message → AI Processing → Escalation Check → Human Agent (if needed)
                                      ↓
                              Agent Dashboard ← Agent Response
```

## Components

### 1. Agent Service (`bot/services/agent/AgentService.js`)

Manages agents and escalations:

```javascript
// Create agent
const agent = agentService.createAgent({
  name: 'Sarah Johnson',
  email: 'sarah@company.com',
  clientId: 'supa-chat',
  skills: ['Technical Support', 'Billing'],
  maxConcurrentChats: 5
});

// Check escalation
const escalationCheck = agentService.shouldEscalate(clientId, message, context);

// Create escalation
const escalation = agentService.createEscalation({
  clientId: 'supa-chat',
  sessionId: 'session_123',
  reason: 'Customer requested human assistance',
  priority: 'high'
});
```

### 2. Escalation Controller (`bot/controller/escalationController.js`)

Handles API endpoints for escalations:

- `POST /api/escalation/agent` - Create agent
- `GET /api/escalation/agent/client/:clientId` - Get agents
- `POST /api/escalation/escalation` - Create escalation
- `GET /api/escalation/escalation/client/:clientId` - Get escalations
- `PUT /api/escalation/escalation/:escalationId/assign` - Assign escalation
- `POST /api/escalation/escalation/:escalationId/message` - Add message

### 3. Agent Dashboard (`chat-widget/components/AgentDashboard/AgentDashboard.js`)

Real-time dashboard for agents to manage escalations:

- View all agents and their status
- Monitor pending and active escalations
- Chat with customers directly
- Assign and resolve escalations

## Escalation Triggers

The system automatically escalates based on:

### 1. Keyword Detection
```javascript
{
  id: 'keyword_escalation',
  name: 'Escalation Keywords',
  condition: 'message contains ["speak to human", "agent", "manager"]',
  reason: 'Customer requested human assistance',
  priority: 'medium'
}
```

### 2. Sentiment Analysis
```javascript
{
  id: 'sentiment_negative',
  name: 'Negative Sentiment',
  condition: 'sentiment < -0.5',
  reason: 'Customer appears frustrated or upset',
  priority: 'high'
}
```

### 3. Unresolved Queries
```javascript
{
  id: 'unresolved_queries',
  name: 'Unresolved Queries',
  condition: 'unresolvedCount >= 3',
  reason: 'Multiple unresolved queries',
  priority: 'medium'
}
```

### 4. Complex Technical Issues
```javascript
{
  id: 'complex_technical',
  name: 'Complex Technical Issue',
  condition: 'message contains technical keywords AND length > 100',
  reason: 'Complex technical issue requiring human expertise',
  priority: 'high'
}
```

## Agent Management

### Agent Status
- **Online**: Available for new escalations
- **Busy**: Currently handling escalations
- **Away**: Temporarily unavailable
- **Offline**: Not available

### Agent Availability
```javascript
availability: {
  monday: { start: '09:00', end: '17:00', available: true },
  tuesday: { start: '09:00', end: '17:00', available: true },
  // ... other days
}
```

### Skills and Load Balancing
- Agents have specific skills (Technical Support, Billing, etc.)
- System assigns escalations based on agent skills and current load
- Maximum concurrent chats per agent is configurable

## Escalation Flow

### 1. Customer Message
Customer sends message through widget

### 2. AI Processing
AI processes message and generates response

### 3. Escalation Check
System checks if escalation is needed based on rules

### 4. Escalation Creation
If escalation needed:
- Create escalation record
- Try to assign to available agent
- Return appropriate response to customer

### 5. Agent Assignment
- Find available agent with matching skills
- Assign escalation to agent
- Notify customer of assignment

### 6. Human Handoff
- Agent takes over conversation
- Customer sees agent name in widget
- Real-time chat between customer and agent

## API Integration

### Create Agent
```bash
POST /api/escalation/agent
Content-Type: application/json

{
  "name": "Sarah Johnson",
  "email": "sarah@company.com",
  "clientId": "supa-chat",
  "skills": ["Technical Support", "Billing"],
  "maxConcurrentChats": 5,
  "availability": {
    "monday": { "start": "09:00", "end": "17:00", "available": true }
  }
}
```

### Create Escalation
```bash
POST /api/escalation/escalation
Content-Type: application/json

{
  "clientId": "supa-chat",
  "sessionId": "session_123",
  "userId": "user_456",
  "reason": "Customer requested human assistance",
  "priority": "high",
  "messages": [
    {
      "content": "I need help with my account",
      "sender": "customer",
      "senderType": "customer"
    }
  ]
}
```

### Add Message to Escalation
```bash
POST /api/escalation/escalation/:escalationId/message
Content-Type: application/json

{
  "content": "I can help you with that. What's the issue?",
  "sender": "Sarah Johnson",
  "senderType": "agent"
}
```

## Widget Integration

The chat widget automatically handles escalations:

### Escalation Response
```javascript
{
  "success": true,
  "response": "I understand you need human assistance. I've connected you with Sarah Johnson, who will be with you shortly.",
  "escalation": {
    "id": "escalation_123",
    "status": "assigned",
    "agent": {
      "name": "Sarah Johnson",
      "id": "agent_456"
    }
  }
}
```

### Widget UI Changes
- Header shows agent name when connected
- Input is disabled while waiting for agent
- Escalation indicator shows status
- Real-time updates for agent responses

## Configuration

### Client Configuration
Add escalation settings to client config:

```json
{
  "clientId": "supa-chat",
  "escalation": {
    "enabled": true,
    "rules": [
      {
        "id": "keyword_escalation",
        "enabled": true,
        "keywords": ["speak to human", "agent", "manager"]
      }
    ],
    "defaultPriority": "medium",
    "maxWaitTime": 300
  }
}
```

### Environment Variables
```bash
# Agent notification settings
AGENT_NOTIFICATION_EMAIL=true
AGENT_NOTIFICATION_SLACK=false

# Escalation settings
DEFAULT_ESCALATION_PRIORITY=medium
MAX_ESCALATION_WAIT_TIME=300
```

## Monitoring and Analytics

### Agent Statistics
- Total escalations handled
- Average response time
- Resolution rate
- Current load

### Escalation Metrics
- Escalation rate by trigger
- Average wait time
- Resolution time
- Customer satisfaction

### Dashboard Features
- Real-time escalation queue
- Agent status monitoring
- Performance metrics
- Historical data

## Best Practices

### 1. Escalation Rules
- Start with simple keyword-based rules
- Gradually add sentiment and context-based rules
- Monitor false positive rates
- Adjust rules based on data

### 2. Agent Management
- Train agents on escalation procedures
- Set realistic availability schedules
- Monitor agent load and performance
- Provide escalation context and history

### 3. Customer Experience
- Set clear expectations for wait times
- Provide status updates during escalation
- Ensure smooth handoff between AI and human
- Follow up on resolved escalations

### 4. Performance Optimization
- Cache agent availability data
- Use efficient queue management
- Implement proper error handling
- Monitor system performance

## Troubleshooting

### Common Issues

1. **Escalations not triggering**
   - Check escalation rules configuration
   - Verify message content matches rules
   - Check agent availability

2. **Agents not receiving escalations**
   - Verify agent status is "online"
   - Check agent availability schedule
   - Ensure agent has required skills

3. **Widget not showing escalation status**
   - Check API response format
   - Verify widget JavaScript is up to date
   - Check browser console for errors

### Debug Mode
Enable debug mode in widget configuration:

```javascript
window.SupaChatbotConfig = {
  // ... other config
  debug: true
};
```

## Future Enhancements

- **Smart Routing**: AI-powered agent assignment based on conversation context
- **Predictive Escalation**: ML models to predict when escalation is needed
- **Multi-language Support**: Escalation rules for different languages
- **Integration APIs**: Connect with external ticketing systems
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile App**: Dedicated agent mobile application
