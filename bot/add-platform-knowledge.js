import mongoose from 'mongoose';
import Agent from './models/agentModel.js';
import NLPPipeline from './services/nlp/NLPPipeline.js';

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.log('❌ MONGODB_URI environment variable not set');
  process.exit(1);
}
await mongoose.connect(mongoUri);
console.log('✅ Connected to MongoDB Atlas');

// Your agent ID from the logs
const agentId = 'agent_1759963468483_eox5ffidd';
const companyId = 'company_mock_12345';

// Platform knowledge content
const platformKnowledge = {
  title: 'Miana Platform - Account Creation & User Guide',
  content: `
**How to Create an Account on Miana:**

1. **Sign Up Process:**
   - Visit the Miana website
   - Click "Start Building Free" or "Sign Up"
   - Choose your signup method:
     * Email and password
     * Google account (recommended)
   - Fill in your details (name, email, password)
   - Verify your email address
   - Complete your profile setup

2. **Account Types:**
   - **Free Plan**: Basic features, limited agents
   - **Pro Plan**: Advanced features, more agents
   - **Enterprise Plan**: Full features, unlimited agents

3. **Getting Started:**
   - After signup, you'll be redirected to the Agent Builder
   - Create your first AI agent
   - Configure your agent's personality
   - Add knowledge to your agent
   - Deploy and test your agent

4. **Account Management:**
   - Access your dashboard from the main menu
   - View all your agents
   - Manage billing and subscriptions
   - Update your profile information
   - View usage statistics

5. **Support & Help:**
   - Check the documentation
   - Contact support via email
   - Join the community forum
   - Watch tutorial videos

**Common Questions:**
- Q: Is Miana free to use?
- A: Yes, we offer a free plan with basic features. You can upgrade anytime.

- Q: How many agents can I create?
- A: Free plan allows 3 agents, Pro plan allows 10, Enterprise is unlimited.

- Q: Can I integrate my agent with my website?
- A: Yes, we provide embed codes and API access for easy integration.

- Q: What payment methods do you accept?
- A: We accept all major credit cards and PayPal.

**Getting Help:**
If you need assistance with account creation or any other questions, please contact our support team at support@miana.ai or visit our help center.
  `,
  type: 'text'
};

// General AI Agent knowledge
const agentKnowledge = {
  title: 'AI Agent Creation & Management Guide',
  content: `
**Creating Your First AI Agent:**

1. **Agent Setup:**
   - Go to the "Build" tab in your dashboard
   - Click "Create New Agent"
   - Give your agent a name and description
   - Choose your agent's personality (friendly, professional, casual, etc.)
   - Select your industry (optional)

2. **Training Your Agent:**
   - Add knowledge in the "Train" tab
   - Upload documents, add text, or crawl websites
   - Create Q&A pairs for common questions
   - Test your agent with sample questions

3. **Deploying Your Agent:**
   - Go to the "Deploy" tab
   - Get your embed code for websites
   - Copy your API key for integrations
   - Test your agent in the chat widget

4. **Agent Management:**
   - Monitor usage and performance
   - Update knowledge as needed
   - Adjust personality and responses
   - View conversation history

**Best Practices:**
- Start with clear, specific knowledge
- Test your agent regularly
- Update knowledge based on user feedback
- Keep responses concise and helpful
- Use your agent's personality consistently

**Troubleshooting:**
- If your agent gives wrong answers, add more specific knowledge
- If responses are too long, adjust the max tokens setting
- If the agent doesn't understand questions, add more Q&A pairs
- If the agent is too formal/casual, adjust the personality setting
  `,
  type: 'text'
};

try {
  // Find the agent
  const agent = await Agent.findOne({ agentId, companyId });
  if (!agent) {
    console.log('❌ Agent not found');
    process.exit(1);
  }

  console.log('✅ Found agent:', agent.name);

  // Add platform knowledge
  const platformKnowledgeItem = {
    id: Date.now().toString(),
    title: platformKnowledge.title,
    type: platformKnowledge.type,
    content: platformKnowledge.content,
    status: 'saved',
    createdAt: new Date()
  };

  // Add agent knowledge
  const agentKnowledgeItem = {
    id: (Date.now() + 1).toString(),
    title: agentKnowledge.title,
    type: agentKnowledge.type,
    content: agentKnowledge.content,
    status: 'saved',
    createdAt: new Date()
  };

  agent.knowledgeBase.push(platformKnowledgeItem, agentKnowledgeItem);
  await agent.save();

  console.log('✅ Added platform and agent knowledge to agent');

  // Process both knowledge items through NLP pipeline
  console.log('🔄 Processing knowledge through NLP pipeline...');
  
  const nlpPipeline = new NLPPipeline();
  const textContent = [
    {
      content: platformKnowledge.content,
      title: platformKnowledge.title,
      url: `text://${platformKnowledge.title}`,
      category: 'platform-knowledge',
      metadata: {
        source: 'text-input',
        type: 'text',
        title: platformKnowledge.title,
        id: platformKnowledgeItem.id
      }
    },
    {
      content: agentKnowledge.content,
      title: agentKnowledge.title,
      url: `text://${agentKnowledge.title}`,
      category: 'agent-knowledge',
      metadata: {
        source: 'text-input',
        type: 'text',
        title: agentKnowledge.title,
        id: agentKnowledgeItem.id
      }
    }
  ];

  const result = await nlpPipeline.processCrawledContent(
    agentId,
    companyId,
    textContent
  );

  console.log('✅ NLP Pipeline completed:', {
    totalChunks: result.totalChunks,
    totalVectors: result.totalVectors,
    processingTime: result.processingTime
  });

  console.log('🎉 Platform knowledge successfully added to your agent!');
  console.log('📚 Your agent now knows about:');
  console.log('   - Account creation process');
  console.log('   - Platform features and plans');
  console.log('   - AI agent creation');
  console.log('   - Common questions and answers');
  console.log('   - Support and help resources');

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
  process.exit(0);
}
