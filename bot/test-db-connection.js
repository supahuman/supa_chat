import mongoose from 'mongoose';

// Connection URI - using the provided MongoDB connection string
const MONGODB_URI = "mongodb+srv://successkoncepts:Engin33!classic@african-vibes-prod.l64busa.mongodb.net/miana?retryWrites=true&w=majority&appName=african-vibes-prod";

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB');

    // Test if we can access the database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📋 Available collections: ${collections.map(c => c.name).join(', ')}`);

    // Check if Agent collection exists and count documents
    const agentCount = await db.collection('agents').countDocuments();
    console.log(`👥 Total agents in database: ${agentCount}`);

    // Look for the specific agent
    const agentId = 'agent_1760555988812_ht1ma2dyf';
    const agent = await db.collection('agents').findOne({ agentId: agentId });

    if (agent) {
      console.log(`✅ Found agent: ${agent.name}`);
      console.log(`📋 Agent details:`);
      console.log(`   - Name: ${agent.name}`);
      console.log(`   - Company ID: ${agent.companyId}`);
      console.log(`   - Status: ${agent.status}`);
      console.log(`   - Knowledge entries: ${agent.knowledgeBase ? agent.knowledgeBase.length : 0}`);

      if (agent.knowledgeBase && agent.knowledgeBase.length > 0) {
        console.log(`📚 Knowledge entries:`);
        agent.knowledgeBase.forEach((kb, index) => {
          console.log(`   ${index + 1}. ${kb.title} (${kb.type}) - Status: ${kb.status}`);
        });
      } else {
        console.log(`❌ No knowledge entries found in agent`);
      }
    } else {
      console.log(`❌ Agent '${agentId}' not found in database`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  }
}

testConnection();
