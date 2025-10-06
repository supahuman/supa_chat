// Bot utility functions for conditional initialization

/**
 * Initializes bot routes and services if BOT_ENABLED is true
 * @returns {Object} - Object containing chatRoutes and knowledgeBaseRoutes
 */
export async function initializeBot() {
  let chatRoutes = null;
  let clientRoutes = null;

  if (process.env.BOT_ENABLED === 'true') {
    try {
      chatRoutes = (await import('../routes/chatRoutes.js')).default;
      clientRoutes = (await import('../routes/clientRoutes.js')).default;
      console.log('🤖 Bot routes loaded successfully');

      // Knowledge base is now handled by NLP pipeline
      console.log('📚 Knowledge base handled by NLP pipeline');
    } catch (error) {
      console.warn('⚠️ Bot routes not loaded:', error.message);
    }
  } else {
    console.log('ℹ️ Bot is disabled. Set BOT_ENABLED=true to enable.');
  }

  return { chatRoutes, clientRoutes };
}

/**
 * Registers bot routes with the Express app if they exist
 * @param {Object} app - Express app instance
 * @param {Object} botRoutes - Object containing chatRoutes and knowledgeBaseRoutes
 */
export function registerBotRoutes(app, botRoutes) {
  const { chatRoutes, clientRoutes } = botRoutes;

  if (chatRoutes) {
    app.use('/api/bot', chatRoutes); // Chat routes for AI customer service
    
    if (clientRoutes) {
      app.use('/api/client', clientRoutes);
      console.log('👥 Client management API endpoints available at /api/client');
    }
    
    console.log('🤖 Bot API endpoints available at /api/bot');
  }
}
