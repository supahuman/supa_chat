// Bot utility functions for conditional initialization

/**
 * Initializes bot routes and services if BOT_ENABLED is true
 * @returns {Object} - Object containing chatRoutes and knowledgeBaseRoutes
 */
export async function initializeBot() {
  let chatRoutes = null;
  let knowledgeBaseRoutes = null;

  if (process.env.BOT_ENABLED === 'true') {
    try {
      chatRoutes = (await import('../routes/chatRoutes.js')).default;
      knowledgeBaseRoutes = (
        await import('../routes/knowledgeBaseRoutes.js')
      ).default;
      console.log('🤖 Bot routes loaded successfully');

      // Initialize knowledge base service with crawling
      try {
        const knowledgeBaseService = (
          await import('../services/knowledgeBaseService.js')
        ).default;
        await knowledgeBaseService.initialize();

        // Load complete knowledge base (static + crawled)
        const loadResult =
          await knowledgeBaseService.loadCompleteKnowledgeBase();

        if (loadResult.success) {
          console.log('📚 Complete knowledge base loaded successfully');
          console.log(`📖 Static: ${loadResult.static?.count || 0} chunks`);
          console.log(
            `🕷️ Crawled: ${loadResult.crawled?.addedChunks || 0} chunks`
          );
          console.log(`📊 Total: ${loadResult.stats?.totalChunks || 0} chunks`);
        } else {
          console.warn('⚠️ Knowledge base loading failed:', loadResult.error);
        }
      } catch (error) {
        console.warn(
          '⚠️ Knowledge base service initialization failed:',
          error.message
        );
      }
    } catch (error) {
      console.warn('⚠️ Bot routes not loaded:', error.message);
    }
  } else {
    console.log('ℹ️ Bot is disabled. Set BOT_ENABLED=true to enable.');
  }

  return { chatRoutes, knowledgeBaseRoutes };
}

/**
 * Registers bot routes with the Express app if they exist
 * @param {Object} app - Express app instance
 * @param {Object} botRoutes - Object containing chatRoutes and knowledgeBaseRoutes
 */
export function registerBotRoutes(app, botRoutes) {
  const { chatRoutes, knowledgeBaseRoutes } = botRoutes;

  if (chatRoutes && knowledgeBaseRoutes) {
    app.use('/api/bot', chatRoutes); // Chat routes for AI customer service
    app.use('/api/bot/knowledge-base', knowledgeBaseRoutes); // Knowledge base management routes
    console.log('🤖 Bot API endpoints available at /api/bot');
    console.log(
      '📚 Knowledge base API endpoints available at /api/bot/knowledge-base'
    );
  }
}
