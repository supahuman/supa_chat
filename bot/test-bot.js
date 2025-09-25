import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import ragService from './services/ragService.js';
import groqService from './services/groqService.js';
import vectorDBService from './services/vectorDBService.js';

async function testBot() {
  console.log('🤖 Testing African Vibes Bot...\n');

  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Test 1: Groq Connection
    console.log('\n1. Testing Groq connection...');
    const groqTest = await groqService.testConnection();
    console.log(
      groqTest ? '✅ Groq connection successful' : '❌ Groq connection failed'
    );

    // Test 2: Vector DB Connection (MongoDB)
    console.log('\n2. Testing Vector DB connection...');
    const vectorTest = await vectorDBService.testConnection();
    console.log(
      vectorTest
        ? '✅ Vector DB connection successful'
        : '❌ Vector DB connection failed'
    );

    // Test 3: RAG Service
    console.log('\n3. Testing RAG service...');
    const ragTest = await ragService.testService();
    console.log('RAG Service Test:', ragTest);

    // Test 4: Sample Query (if services are working)
    if (groqTest && vectorTest) {
      console.log('\n4. Testing sample query...');
      const sampleQuery = 'How do I create an event?';
      console.log(`Query: "${sampleQuery}"`);

      const result = await ragService.processQuery(sampleQuery);
      console.log('Response:', result.success ? '✅ Success' : '❌ Failed');
      if (result.success) {
        console.log('Bot Response:', result.response);
        console.log('Confidence:', result.confidence);
        console.log('Sources found:', result.sources.length);
      }
    }

    // Test 5: Knowledge Base Info
    console.log('\n5. Knowledge Base Info...');
    const kbInfo = await ragService.getKnowledgeBaseInfo();
    console.log('Knowledge Base:', kbInfo);
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBot();
}

export default testBot;
