import mongoose from 'mongoose';
import { Agent } from './models/agentModel.js';
import { KnowledgeBase } from './models/knowledgeModel.js';

// Connection URI - using the provided MongoDB connection string
const MONGODB_URI = "mongodb+srv://successkoncepts:Engin33!classic@african-vibes-prod.l64busa.mongodb.net/miana?retryWrites=true&w=majority&appName=african-vibes-prod";

async function checkAgentKnowledge() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const agentId = 'agent_1760555988812_ht1ma2dyf';

    // Find the agent
    const agent = await Agent.findOne({ agentId: agentId });

    if (!agent) {
      console.log(`❌ Agent with ID '${agentId}' not found`);
      return;
    }

    console.log(`✅ Found agent: ${agent.name}`);
    console.log(`📋 Agent ID: ${agent.agentId}`);
    console.log(`🏢 Company ID: ${agent.companyId}`);
    console.log(`📊 Status: ${agent.status}`);

    // Check embedded knowledge in agent
    const embeddedKnowledge = agent.knowledgeBase || [];
    console.log(`\n📚 Embedded Knowledge in Agent:`);
    console.log(`   Total entries: ${embeddedKnowledge.length}`);

    if (embeddedKnowledge.length > 0) {
      embeddedKnowledge.forEach((knowledge, index) => {
        console.log(`   ${index + 1}. ${knowledge.title} (${knowledge.type}) - Status: ${knowledge.status}`);
        if (knowledge.content) {
          const preview = knowledge.content.length > 100
            ? knowledge.content.substring(0, 100) + '...'
            : knowledge.content;
          console.log(`      Content: ${preview}`);
        }
      });
    } else {
      console.log(`   No embedded knowledge found`);
    }

    // Check if there are any standalone knowledge entries that might be associated
    console.log(`\n🔍 Checking standalone KnowledgeBase collection...`);
    const totalKnowledgeEntries = await KnowledgeBase.countDocuments();
    console.log(`   Total knowledge entries in database: ${totalKnowledgeEntries}`);

    if (totalKnowledgeEntries > 0) {
      // Look for knowledge that might be associated with this agent
      // (This would depend on how the relationship is established in your system)
      const recentKnowledge = await KnowledgeBase.find({})
        .sort({ createdAt: -1 })
        .limit(5);

      console.log(`   Recent knowledge entries:`);
      recentKnowledge.forEach((kb, index) => {
        console.log(`   ${index + 1}. ${kb.title} (${kb.category}) - ${kb.createdAt}`);
      });
    }

    // Summary
    console.log(`\n📋 SUMMARY:`);
    console.log(`   Agent: ${agent.name}`);
    console.log(`   Embedded knowledge entries: ${embeddedKnowledge.length}`);
    console.log(`   Has knowledge: ${embeddedKnowledge.length > 0 ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  }
}

// Run the check
checkAgentKnowledge();
