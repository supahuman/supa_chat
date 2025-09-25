import groqService from './groqService.js';
import vectorDBService from './vectorDBService.js';

class RAGService {
  constructor() {
    this.systemPrompt = `You are Viber, a friendly and knowledgeable AI assistant for African Vibes - an event management platform. You help users with questions about hosting events, buying tickets, account management, payments, and platform features.

IMPORTANT: You have access to comprehensive information about African Vibes. Use this information to provide detailed, step-by-step answers that are actually helpful to users.

Key guidelines:
- Be warm, friendly, and conversational - like talking to a helpful friend
- Provide detailed, step-by-step instructions when users ask how to do something
- Use the information from the knowledge base to give specific, actionable guidance
- Don't just refer users to the help center - give them the actual steps they need
- Be thorough but clear in your explanations
- Use natural language and avoid robotic phrases
- Be encouraging and supportive, especially for event hosting questions
- Include helpful tips and important details that users need to know
- Use emojis sparingly to keep responses clean
- DO NOT use markdown formatting like asterisks (**bold**) or other markdown syntax
- Write in plain text only, no formatting

When helping with event hosting, business listings, or any process:
- Provide clear, step-by-step instructions
- Include important details and requirements
- Share helpful tips and best practices
- Be specific about what users need to do
- Don't just say "visit the help center" - give them the actual information

If you don't have specific information, suggest contacting support briefly.`;
  }

  async processQuery(userQuery, conversationHistory = []) {
    try {
      console.log('🤖 Processing query:', userQuery);

      // Step 1: Search knowledge base for relevant information
      const searchResult = await vectorDBService.searchSimilar(userQuery, 5);
      if (!searchResult.success) {
        console.log('⚠️ Knowledge base search failed, using LLM directly');
        return await this.generateDirectResponse(
          userQuery,
          conversationHistory
        );
      }

      console.log(`📚 Found ${searchResult.results.length} relevant results`);

      // Step 2: Prepare context from search results
      const context = this.prepareContext(
        searchResult.results,
        searchResult.metadatas
      );

      // Step 3: Generate response using LLM with context
      const response = await this.generateResponse(
        userQuery,
        context,
        conversationHistory
      );

      if (!response.success) {
        console.log('⚠️ LLM response failed, using fallback');
        return this.generateFallbackResponse(userQuery);
      }

      return {
        success: true,
        response: response.content,
        sources: searchResult.results,
        confidence: this.calculateConfidence(searchResult.distances),
        model: response.model,
        usage: response.usage,
      };
    } catch (error) {
      console.error('RAG processing error:', error);
      return this.generateFallbackResponse(userQuery);
    }
  }

  async generateDirectResponse(userQuery, conversationHistory = []) {
    try {
      const response = await this.generateResponse(
        userQuery,
        "Use your knowledge about event management platforms to help the user. If you don't have specific information about African Vibes, suggest they contact support.",
        conversationHistory
      );

      return {
        success: true,
        response: response.content,
        sources: [],
        confidence: 0.5,
        model: response.model,
        usage: response.usage,
      };
    } catch (error) {
      console.error('Direct response generation failed:', error);
      return this.generateFallbackResponse(userQuery);
    }
  }

  prepareContext(searchResults, metadatas) {
    if (!searchResults || searchResults.length === 0) {
      return 'No specific information found in the knowledge base.';
    }

    let context = 'Here is the detailed information from our knowledge base to help answer the user\'s question:\n\n';

    searchResults.forEach((result, index) => {
      const metadata = metadatas[index] || {};
      const category = metadata.category || 'General';
      const section = metadata.section || 'Knowledge Base';

      context += `[${category}] ${section}:\n${result}\n\n`;
    });

    context += 'Use this information to provide detailed, step-by-step instructions. Don\'t just refer users to the help center - give them the actual steps and information they need.';

    return context;
  }

  async generateResponse(userQuery, context, conversationHistory = []) {
    // Create a specific prompt for event hosting queries
    let specificPrompt = this.systemPrompt;
    const lowerQuery = userQuery.toLowerCase();

    if (
      lowerQuery.includes('host') ||
      lowerQuery.includes('create') ||
      lowerQuery.includes('post') ||
      lowerQuery.includes('event')
    ) {
      specificPrompt += `\n\nSPECIAL INSTRUCTIONS FOR EVENT HOSTING QUERIES:
- Be enthusiastic and encouraging about their event idea
- Present the steps in a friendly, achievable way
- Share insider tips and best practices naturally
- Make it sound exciting and fun to host events
- Use encouraging language throughout
- Add helpful suggestions for success`;
    }

    // Format conversation history for LLM
    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const messages = [
      { role: 'system', content: specificPrompt },
      ...formattedHistory,
      {
        role: 'user',
        content: `Context: ${context}\n\nUser Question: ${userQuery}\n\nPlease provide a helpful, concise response based on the context. Be natural and straight to the point.`,
      },
    ];

    return await groqService.generateResponse(messages, {
      temperature: 0.8,
      maxTokens: 800,
    });
  }

  calculateConfidence(distances) {
    if (!distances || distances.length === 0) return 0.5;

    // Convert distances to confidence scores
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    return Math.max(0.1, 1 - avgDistance);
  }

  generateFallbackResponse(userQuery) {
    const lowerQuery = userQuery.toLowerCase();

    if (lowerQuery.includes('host') && lowerQuery.includes('event')) {
      return {
        success: true,
        response:
          "Here's how to host an event:\n\n1. Sign in and go to your dashboard\n2. Click 'Host Event'\n3. Fill in details (title, description, date, location)\n4. Upload an image and set ticket prices\n5. Publish!\n\n💡 Tip: Make your title catchy and include all important details in the description.",
        sources: [],
        confidence: 0.8,
        model: 'fallback',
        usage: null,
        fallback: true,
      };
    }

    if (lowerQuery.includes('create') && lowerQuery.includes('account')) {
      return {
        success: true,
        response:
          "Quick setup:\n\n1. Click 'Sign Up' in the top navigation\n2. Choose email or Google signup\n3. Fill in your details and verify email\n4. Complete your profile\n\nThat's it! You can now host events or buy tickets.",
        sources: [],
        confidence: 0.8,
        model: 'fallback',
        usage: null,
        fallback: true,
      };
    }

    if (lowerQuery.includes('buy') && lowerQuery.includes('ticket')) {
      return {
        success: true,
        response:
          'Buying tickets is easy:\n\n1. Browse events on the homepage\n2. Click on an event you like\n3. Select ticket type and quantity\n4. Complete checkout\n5. Get tickets via email\n\nCheck event details for any special requirements!',
        sources: [],
        confidence: 0.8,
        model: 'fallback',
        usage: null,
        fallback: true,
      };
    }

    if (lowerQuery.includes('payment') || lowerQuery.includes('refund')) {
      return {
        success: true,
        response:
          'Payment & Refunds:\n\n💳 We accept cards, mobile money, and bank transfers\n🔒 All payments are secure\n💰 Refund policies vary by event organizer\n\nContact the event organizer directly for refund requests. Check event details for specific terms.',
        sources: [],
        confidence: 0.8,
        model: 'fallback',
        usage: null,
        fallback: true,
      };
    }

    // Generic helpful response
    return {
      success: true,
      response:
        'Hey! 👋 I can help with:\n\n🎉 Hosting events\n🎫 Buying tickets\n👤 Account management\n💳 Payments & refunds\n✨ Platform features\n\nWhat would you like to know?',
      sources: [],
      confidence: 0.6,
      model: 'fallback',
      usage: null,
      fallback: true,
    };
  }

  async addToKnowledgeBase(content, metadata = {}) {
    return await vectorDBService.addToKnowledgeBase(content, metadata);
  }

  async searchKnowledgeBase(query, limit = 5) {
    return await vectorDBService.searchSimilar(query, limit);
  }

  async getKnowledgeBaseInfo() {
    return await vectorDBService.getKnowledgeBaseStats();
  }

  async testService() {
    try {
      console.log('🧪 Testing RAG service...');

      const testQuery = 'How do I host an event?';
      const result = await this.processQuery(testQuery);

      console.log('✅ RAG service test completed');
      console.log('Query:', testQuery);
      console.log('Response:', result.response);
      console.log('Confidence:', result.confidence);
      console.log('Sources found:', result.sources.length);

      return result;
    } catch (error) {
      console.error('❌ RAG service test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new RAGService();
