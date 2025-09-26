import dotenv from 'dotenv';
import ClientConfigService from '../services/client/ClientConfigService.js';

// Load environment variables
dotenv.config();

/**
 * Setup default client configuration for testing
 * This creates the African Vibes client with current MongoDB setup
 */
async function setupDefaultClient() {
  try {
    console.log('🔧 Setting up default client configuration...');
    
    const clientConfigService = new ClientConfigService();
    
    // Default client configuration (Supa Chat)
    const defaultConfig = {
      vectorDB: {
        type: 'mongodb',
        connectionString: process.env.MONGODB_URI,
        database: process.env.MONGODB_DB_NAME || 'supa_chatbot_db',
        collection: 'knowledgebases',
        vectorIndex: process.env.ATLAS_VECTOR_INDEX || 'vector_index',
        numCandidates: Number(process.env.VECTOR_CANDIDATES || 200),
        similarity: process.env.VECTOR_SIMILARITY || 'cosine'
      },
      embeddingProvider: 'openai',
      chunkingStrategy: 'langchain',
      openaiApiKey: process.env.OPENAI_API_KEY,
      groqApiKey: process.env.GROQ_API_KEY
    };
    
    // Set default client configuration
    await clientConfigService.setClientConfig('supa-chat', defaultConfig);
    
    console.log('✅ Default client configuration created:');
    console.log('- Client ID: supa-chat');
    console.log('- Database: MongoDB Atlas');
    console.log('- Embedding Provider: OpenAI');
    console.log('- Chunking Strategy: LangChain');
    
    // Test the configuration
    const config = clientConfigService.getClientConfig('supa-chat');
    if (config) {
      console.log('✅ Configuration verified successfully');
    } else {
      console.log('❌ Configuration verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error setting up default client:', error.message);
  }
}

setupDefaultClient();
