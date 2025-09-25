import mongoose from 'mongoose';
import vectorDBService from './services/vectorDBService.js';
import ragService from './services/ragService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function initializeBot() {
  try {
    console.log('🚀 Initializing African Vibes Bot...');

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Initialize vector database service
    await vectorDBService.initialize();

    // Load knowledge base
    const loadResult = await vectorDBService.loadKnowledgeBase();

    if (loadResult.success) {
      console.log(
        `✅ Knowledge base loaded successfully (${loadResult.count} chunks)`
      );

      // Test the RAG service
      const testResult = await ragService.testService();
      if (testResult.success) {
        console.log('✅ RAG service test successful');
        console.log(`Test query: "${testResult.testQuery}"`);
        console.log(`Response: "${testResult.response.substring(0, 100)}..."`);
        console.log(`Confidence: ${testResult.confidence}`);
      } else {
        console.log('⚠️ RAG service test failed');
      }
    } else {
      console.error('❌ Failed to load knowledge base:', loadResult.error);
    }

    // Get knowledge base stats
    const stats = await vectorDBService.getKnowledgeBaseStats();
    if (stats.success) {
      console.log('📊 Knowledge Base Stats:');
      console.log(`Total chunks: ${stats.totalChunks}`);
      console.log('Categories:', stats.categories);
    }
  } catch (error) {
    console.error('❌ Bot initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run initialization
initializeBot();
