import mongoose from 'mongoose';
import AgentVector from './models/agentVectorModel.js';

mongoose.connect('mongodb+srv://meroka:meroka123@cluster0.8qgqj.mongodb.net/supa_chatbot?retryWrites=true&w=majority');

const agentId = 'agent_1759857952940_4d1e9sgcy';
const companyId = 'company_mock_12345';

console.log('🔍 Checking vectors for agent:', agentId);
console.log('🏢 Company ID:', companyId);

const vectors = await AgentVector.find({ agentId, companyId });
console.log('📊 Found', vectors.length, 'vectors');

if (vectors.length > 0) {
  console.log('📝 Vector details:');
  vectors.forEach((vector, index) => {
    console.log(`  ${index + 1}. Source: ${vector.source?.type || 'unknown'}`);
    console.log(`     Content preview: ${vector.content?.substring(0, 100)}...`);
    console.log(`     Created: ${vector.createdAt}`);
  });
} else {
  console.log('❌ No vectors found for this agent');
  
  // Check if there are any vectors for this company
  const allVectors = await AgentVector.find({ companyId });
  console.log(`📊 Total vectors for company: ${allVectors.length}`);
  
  if (allVectors.length > 0) {
    console.log('📝 Other agents with vectors:');
    const agentCounts = {};
    allVectors.forEach(vector => {
      agentCounts[vector.agentId] = (agentCounts[vector.agentId] || 0) + 1;
    });
    
    Object.entries(agentCounts).forEach(([id, count]) => {
      console.log(`  - ${id}: ${count} vectors`);
    });
  }
}

process.exit(0);
