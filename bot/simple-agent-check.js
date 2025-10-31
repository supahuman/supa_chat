import mongoose from 'mongoose';

// Connection URI - using the provided MongoDB connection string
const MONGODB_URI = "mongodb+srv://successkoncepts:Engin33!classic@african-vibes-prod.l64busa.mongodb.net/miana?retryWrites=true&w=majority&appName=african-vibes-prod";

async function simpleAgentCheck() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📋 Using URI:', MONGODB_URI.replace(/:[^:]+@/, ':****:****@')); // Hide password

    // Connect with timeout
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });

    console.log('✅ Connected successfully to MongoDB');

    // Get database reference
    const db = mongoose.connection.db;

    // Check available collections
    const collections = await db.listCollections().toArray();
    console.log(`📋 Available collections: ${collections.map(c => c.name).join(', ')}`);

    // Look for the specific agent
    const agentId = 'agent_1760555988812_ht1ma2dyf';
    console.log(`🔍 Searching for agent: ${agentId}`);

    const agent = await db.collection('agents').findOne({ agentId: agentId });

    if (agent) {
      console.log(`✅ FOUND AGENT:`);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Agent ID: ${agent.agentId}`);
      console.log(`   Company ID: ${agent.companyId}`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Created: ${agent.createdAt}`);

      // Check knowledge base
      const knowledgeBase = agent.knowledgeBase || [];
      console.log(`   Knowledge entries: ${knowledgeBase.length}`);

      if (knowledgeBase.length > 0) {
        console.log(`📚 KNOWLEDGE BASE DETAILS:`);
        knowledgeBase.forEach((kb, index) => {
          console.log(`   ${index + 1}. ${kb.title}`);
          console.log(`      Type: ${kb.type}`);
          console.log(`      Status: ${kb.status}`);
          console.log(`      Content length: ${kb.content ? kb.content.length : 0} characters`);
          if (kb.url) console.log(`      URL: ${kb.url}`);
          if (kb.fileName) console.log(`      File: ${kb.fileName}`);
          console.log(`      ---`);
        });
        console.log(`✅ Agent HAS knowledge`);
      } else {
        console.log(`❌ Agent has NO knowledge entries`);
      }
    } else {
      console.log(`❌ Agent '${agentId}' NOT found in database`);
      console.log(`📋 Checking if any agents exist...`);

      const agentCount = await db.collection('agents').countDocuments();
      console.log(`   Total agents in database: ${agentCount}`);

      if (agentCount > 0) {
        console.log(`📋 Sample agents:`);
        const sampleAgents = await db.collection('agents').find({}).limit(3).toArray();
        sampleAgents.forEach((agent, index) => {
          console.log(`   ${index + 1}. ${agent.name} (${agent.agentId})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.codeName) console.error('Error name:', error.codeName);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('🔒 Connection closed');
    } catch (closeError) {
      console.error('Error closing connection:', closeError.message);
    }
  }
}

simpleAgentCheck();
