// Bot utility functions for conditional initialization

/**
 * Initializes bot routes and services if BOT_ENABLED is true
 * @returns {Object} - Object containing chatRoutes and knowledgeBaseRoutes
 */
export async function initializeBot() {
  let chatRoutes = null;
  let langchainKnowledgeBaseRoutes = null;
  let chunkingStrategyRoutes = null;
  let clientRoutes = null;

  if (process.env.BOT_ENABLED === 'true') {
    try {
      chatRoutes = (await import('../routes/chatRoutes.js')).default;
      langchainKnowledgeBaseRoutes = (
        await import('../routes/langchainKnowledgeBaseRoutes.js')
      ).default;
      chunkingStrategyRoutes = (
        await import('../routes/chunkingStrategyRoutes.js')
      ).default;
      clientRoutes = (await import('../routes/clientRoutes.js')).default;
      console.log('🤖 Bot routes loaded successfully');

      // Knowledge base is now handled by client-specific services
      console.log('📚 Knowledge base handled by client-specific services');
    } catch (error) {
      console.warn('⚠️ Bot routes not loaded:', error.message);
    }
  } else {
    console.log('ℹ️ Bot is disabled. Set BOT_ENABLED=true to enable.');
  }

  return { chatRoutes, langchainKnowledgeBaseRoutes, chunkingStrategyRoutes, clientRoutes };
}

/**
 * Registers bot routes with the Express app if they exist
 * @param {Object} app - Express app instance
 * @param {Object} botRoutes - Object containing chatRoutes and knowledgeBaseRoutes
 */
export function registerBotRoutes(app, botRoutes) {
  const { chatRoutes, langchainKnowledgeBaseRoutes, chunkingStrategyRoutes, clientRoutes } = botRoutes;

  if (chatRoutes) {
    app.use('/api/bot', chatRoutes); // Chat routes for AI customer service
    
    // Register LangChain routes if available
    if (langchainKnowledgeBaseRoutes) {
      app.use('/api/bot/knowledge-base/langchain', langchainKnowledgeBaseRoutes);
      console.log('🔗 LangChain API endpoints available at /api/bot/knowledge-base/langchain');
    }
    
    // Register chunking strategy routes if available
    if (chunkingStrategyRoutes) {
      app.use('/api/bot/chunking-strategy', chunkingStrategyRoutes);
      console.log('⚙️ Chunking strategy API endpoints available at /api/bot/chunking-strategy');
    }
    if (clientRoutes) {
      app.use('/api/client', clientRoutes);
      console.log('👥 Client management API endpoints available at /api/client');
    }
    
    console.log('🤖 Bot API endpoints available at /api/bot');
  }
}
