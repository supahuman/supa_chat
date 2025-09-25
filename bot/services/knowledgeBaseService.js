import vectorDBService from './vectorDBService.js';
import webCrawlerService from './webCrawlerService.js';
import chunkingService from './chunkingService.js';

class KnowledgeBaseService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    try {
      await vectorDBService.initialize();
      this.initialized = true;
      console.log('✅ Knowledge Base Service initialized');
    } catch (error) {
      console.error('❌ Knowledge Base Service initialization failed:', error);
      this.initialized = false;
    }
  }

  async loadCompleteKnowledgeBase() {
    if (!this.initialized) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      console.log('📚 Loading complete knowledge base...');

      // Step 1: Load static knowledge base
      const staticResult = await this.loadStaticKnowledgeBase();

      // Step 2: Crawl and load help center content
      const crawledResult = await this.loadCrawledContent();

      // Step 3: Get final statistics
      const stats = await vectorDBService.getKnowledgeBaseStats();

      return {
        success: true,
        static: staticResult,
        crawled: crawledResult,
        stats: stats,
      };
    } catch (error) {
      console.error('❌ Failed to load complete knowledge base:', error);
      return { success: false, error: error.message };
    }
  }

  async loadStaticKnowledgeBase() {
    try {
      console.log('📖 Loading static knowledge base...');
      const result = await vectorDBService.loadKnowledgeBase();

      if (result.success) {
        console.log(`✅ Static knowledge base loaded (${result.count} chunks)`);
      } else {
        console.warn('⚠️ Static knowledge base loading failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ Static knowledge base error:', error);
      return { success: false, error: error.message };
    }
  }

  async loadCrawledContent() {
    try {
      console.log('🕷️ Crawling help center content...');

      // Crawl the help center
      const crawlResult = await webCrawlerService.crawlHelpCenter();

      if (!crawlResult.success) {
        console.warn('⚠️ Crawling failed:', crawlResult.error);
        return { success: false, error: crawlResult.error };
      }

      console.log(`🕷️ Crawled ${crawlResult.count} content sections`);

      // Process and chunk the crawled content
      const processedContent = await this.processCrawledContent(
        crawlResult.content
      );

      if (processedContent.length === 0) {
        console.warn('⚠️ No content processed from crawling');
        return { success: false, error: 'No content processed' };
      }

      // Add to vector database
      const addResult = await this.addCrawledContentToDB(processedContent);

      if (addResult.success) {
        console.log(
          `✅ Added ${addResult.count} crawled chunks to knowledge base`
        );
      } else {
        console.warn('⚠️ Failed to add crawled content:', addResult.error);
      }

      return {
        success: true,
        crawledSections: crawlResult.count,
        processedChunks: processedContent.length,
        addedChunks: addResult.count || 0,
      };
    } catch (error) {
      console.error('❌ Crawled content loading error:', error);
      return { success: false, error: error.message };
    }
  }

  async processCrawledContent(content) {
    const processedChunks = [];

    for (const item of content) {
      try {
        // Create chunks from the content
        const chunks = await this.createChunksFromContent(item);
        processedChunks.push(...chunks);
      } catch (error) {
        console.warn(
          `⚠️ Failed to process content from ${item.url}:`,
          error.message
        );
      }
    }

    return processedChunks;
  }

  async createChunksFromContent(contentItem) {
    const chunks = [];

    // Split content into paragraphs
    const paragraphs = contentItem.content
      .split('\n\n')
      .filter((p) => p.trim().length > 50);

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();

      if (paragraph.length < 100) continue; // Skip very short paragraphs

      // Create chunk with context
      let chunkContent = paragraph;

      // Add title for context
      if (contentItem.title) {
        chunkContent = `Title: ${contentItem.title}\n\n${chunkContent}`;
      }

      // Add URL for reference
      chunkContent += `\n\nSource: ${contentItem.url}`;

      chunks.push({
        content: chunkContent,
        title: contentItem.title,
        category: contentItem.category,
        metadata: {
          ...contentItem.metadata,
          source: 'crawled',
          url: contentItem.url,
          chunkIndex: i,
        },
      });
    }

    return chunks;
  }

  async addCrawledContentToDB(chunks) {
    try {
      let addedCount = 0;

      for (const chunk of chunks) {
        const result = await vectorDBService.addToKnowledgeBase(chunk.content, {
          title: chunk.title,
          category: chunk.category,
          ...chunk.metadata,
        });

        if (result.success) {
          addedCount++;
        }
      }

      return { success: true, count: addedCount };
    } catch (error) {
      console.error('❌ Failed to add crawled content to DB:', error);
      return { success: false, error: error.message };
    }
  }

  async updateKnowledgeBase() {
    try {
      console.log('🔄 Updating knowledge base...');

      // Clear existing crawled content
      await this.clearCrawledContent();

      // Reload with fresh crawled content
      const result = await this.loadCrawledContent();

      return result;
    } catch (error) {
      console.error('❌ Knowledge base update failed:', error);
      return { success: false, error: error.message };
    }
  }

  async clearCrawledContent() {
    try {
      // Remove only crawled content, keep static content
      const result = await vectorDBService.knowledgeBaseModel.deleteMany({
        'metadata.source': 'crawled',
      });

      console.log(`🗑️ Cleared ${result.deletedCount} crawled content chunks`);
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('❌ Failed to clear crawled content:', error);
      return { success: false, error: error.message };
    }
  }

  async getKnowledgeBaseInfo() {
    try {
      const stats = await vectorDBService.getKnowledgeBaseStats();

      if (stats.success) {
        // Get source breakdown
        const sourceStats = await vectorDBService.knowledgeBaseModel.aggregate([
          {
            $group: {
              _id: '$metadata.source',
              count: { $sum: 1 },
            },
          },
        ]);

        return {
          success: true,
          totalChunks: stats.totalChunks,
          categories: stats.categories,
          sources: sourceStats.reduce((acc, item) => {
            acc[item._id || 'unknown'] = item.count;
            return acc;
          }, {}),
        };
      }

      return stats;
    } catch (error) {
      console.error('❌ Failed to get knowledge base info:', error);
      return { success: false, error: error.message };
    }
  }

  async testKnowledgeBase() {
    try {
      const testQueries = [
        'How do I host an event?',
        'What payment methods do you accept?',
        'How do I get a refund?',
        'How do I create an account?',
      ];

      const results = [];

      for (const query of testQueries) {
        const searchResult = await vectorDBService.searchSimilar(query, 2);
        results.push({
          query,
          found: searchResult.success && searchResult.results.length > 0,
          results: searchResult.results?.length || 0,
        });
      }

      return {
        success: true,
        testResults: results,
        summary: {
          totalQueries: testQueries.length,
          successfulSearches: results.filter((r) => r.found).length,
        },
      };
    } catch (error) {
      console.error('❌ Knowledge base test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new KnowledgeBaseService();
