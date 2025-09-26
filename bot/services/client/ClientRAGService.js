import groqService from '../groqService.js';
import DatabaseFactory from '../database/DatabaseFactory.js';
import ClientConfigService from './ClientConfigService.js';

/**
 * Client-specific RAG service that uses client's database
 * Handles AI responses with client-specific knowledge base
 */
class ClientRAGService {
  constructor() {
    this.clientConfigService = new ClientConfigService();
  }

  /**
   * Process query for specific client
   * @param {string} clientId - Client identifier
   * @param {string} userQuery - User's question
   * @param {Array} conversationHistory - Previous conversation messages
   * @returns {Object} AI response with sources and metadata
   */
  async processQuery(clientId, userQuery, conversationHistory = []) {
    try {
      console.log(`🤖 Processing query for client ${clientId}:`, userQuery);

      // Get client configuration
      const clientConfig = this.clientConfigService.getClientConfig(clientId);
      if (!clientConfig) {
        throw new Error(`Client configuration not found: ${clientId}`);
      }

      // Create database connection for client
      const vectorDB = DatabaseFactory.create(clientConfig.vectorDB.type, clientConfig.vectorDB);
      await vectorDB.connect();

      // Search client's knowledge base
      const searchResult = await this.searchClientKnowledgeBase(vectorDB, userQuery);
      if (!searchResult.success) {
        console.log('⚠️ Knowledge base search failed, using LLM directly');
        return await this.generateDirectResponse(userQuery, conversationHistory);
      }

      console.log(`📚 Found ${searchResult.results.length} relevant results for client ${clientId}`);

      // Prepare context from search results
      const context = this.prepareContext(searchResult.results, searchResult.metadatas);

      // Generate AI response
      const response = await this.generateResponse(userQuery, context, conversationHistory);

      await vectorDB.disconnect();

      return {
        success: true,
        response: response.content,
        sources: searchResult.results,
        confidence: this.calculateConfidence(searchResult.results),
        model: response.model,
        usage: response.usage,
        clientId
      };
    } catch (error) {
      console.error(`❌ Error processing query for client ${clientId}:`, error.message);
      return {
        success: false,
        error: error.message,
        clientId
      };
    }
  }

  /**
   * Search client's knowledge base
   * @param {Object} vectorDB - Database adapter
   * @param {string} query - Search query
   * @returns {Object} Search results
   */
  async searchClientKnowledgeBase(vectorDB, query) {
    try {
      // For now, use simple text search
      // Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query);
      
      // Perform vector search
      const searchResult = await vectorDB.search(queryEmbedding, 5);
      
      if (searchResult.success && searchResult.results.length > 0) {
        return {
          success: true,
          results: searchResult.results,
          metadatas: searchResult.metadatas
        };
      } else {
        // Fallback to direct response if no results
        return { success: false, error: 'No relevant results found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Prepare context from search results
   * @param {Array} searchResults - Search results
   * @param {Array} metadatas - Result metadata
   * @returns {string} Formatted context
   */
  prepareContext(searchResults, metadatas) {
    if (!searchResults || searchResults.length === 0) {
      return 'No specific information found in the knowledge base.';
    }

    let context = 'Here is the detailed information from the knowledge base:\n\n';
    searchResults.forEach((result, index) => {
      const metadata = metadatas[index] || {};
      const category = metadata.category || 'General';
      context += `[${category}]:\n${result}\n\n`;
    });

    return context;
  }

  /**
   * Generate AI response using Groq
   * @param {string} userQuery - User's question
   * @param {string} context - Knowledge base context
   * @param {Array} conversationHistory - Previous messages
   * @returns {Object} AI response
   */
  async generateResponse(userQuery, context, conversationHistory = []) {
    const systemPrompt = `You are a helpful AI assistant. Use the provided context to answer questions accurately and helpfully.

Context: ${context}

Guidelines:
- Provide detailed, step-by-step instructions when users ask how to do something
- Use the context information to give specific, actionable guidance
- Be warm, friendly, and conversational
- Don't mention "knowledge base" or "context" - just give the answer naturally
- Write in plain text only, no markdown formatting`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({ role: msg.role, content: msg.content });
    });

    return await groqService.generateResponse(messages);
  }

  /**
   * Generate direct response without knowledge base
   * @param {string} userQuery - User's question
   * @param {Array} conversationHistory - Previous messages
   * @returns {Object} AI response
   */
  async generateDirectResponse(userQuery, conversationHistory = []) {
    const systemPrompt = 'You are a helpful AI assistant. Answer questions to the best of your ability.';
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({ role: msg.role, content: msg.content });
    });

    const response = await groqService.generateResponse(messages);
    
    return {
      success: true,
      response: response.content,
      sources: [],
      confidence: 0.3,
      model: response.model,
      usage: response.usage
    };
  }

  /**
   * Generate query embedding for vector search
   * @param {string} query - Search query
   * @returns {Array} Query embedding
   */
  async generateQueryEmbedding(query) {
    // For now, return a mock embedding since we don't have OpenAI integration
    // This should be replaced with actual embedding generation
    console.log('⚠️ Using mock embedding for query:', query);
    return new Array(1536).fill(0).map(() => Math.random() - 0.5);
  }

  /**
   * Calculate response confidence based on search results
   * @param {Array} results - Search results
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(results) {
    if (!results || results.length === 0) return 0.3;
    if (results.length >= 3) return 0.9;
    if (results.length >= 2) return 0.7;
    return 0.5;
  }
}

export default ClientRAGService;
