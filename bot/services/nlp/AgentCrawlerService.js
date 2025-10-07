import * as cheerio from 'cheerio';
import { RecursiveUrlLoader } from '@langchain/community/document_loaders/web/recursive_url';
import { PlaywrightWebBaseLoader } from '@langchain/community/document_loaders/web/playwright';
import Agent from '../../models/agentModel.js';
import NLPPipeline from './NLPPipeline.js';

class AgentCrawlerService {
  constructor(options = {}) {
    this.options = {
      // Crawling configuration
      maxPages: options.maxPages || 50,
      maxDepth: options.maxDepth || 2,
      delay: options.delay || 1000,
      
      // LangChain loader options
      usePlaywright: options.usePlaywright || false,
      followLinks: options.followLinks || false,
      excludeDirs: options.excludeDirs || ['/admin', '/login', '/api'],
      
      // Content filtering
      minContentLength: options.minContentLength || 100,
      maxContentLength: options.maxContentLength || 50000,
      
      ...options
    };

    this.crawledPages = new Set();
    
    // Initialize NLP Pipeline for complete processing
    this.nlpPipeline = new NLPPipeline({
      chunkSize: 1000,
      chunkOverlap: 200,
      embeddingProvider: 'openai'
    });
  }

  /**
   * Crawl URLs for a specific agent and update its knowledge base
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Array} urls - URLs to crawl
   * @returns {Object} Crawling results
   */
  async crawlForAgent(agentId, companyId, urls) {
    try {
      console.log(`🕷️ Starting crawl for agent ${agentId} with ${urls.length} URLs`);

      // Get the agent
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        throw new Error(`Agent ${agentId} not found for company ${companyId}`);
      }

      const crawledContent = [];
      const errors = [];

      // Crawl each URL using LangChain loaders
      for (const url of urls) {
        try {
          console.log(`🕷️ Crawling with LangChain: ${url}`);
          
          const content = await this.crawlWithLangChain(url);
          if (content) {
            crawledContent.push(content);
            
            // Add delay between requests to be respectful
            await this.delayRequest();
          }
        } catch (error) {
          console.warn(`⚠️ Failed to crawl ${url}:`, error.message);
          errors.push({ url, error: error.message });
        }
      }

      // Process crawled content through NLP pipeline
      if (crawledContent.length > 0) {
        await this.processWithNLPPipeline(agent, crawledContent);
        console.log(`✅ Processed agent ${agentId} with ${crawledContent.length} crawled pages through NLP pipeline`);
      }

      return {
        success: true,
        crawledCount: crawledContent.length,
        errorCount: errors.length,
        errors,
        content: crawledContent
      };

    } catch (error) {
      console.error(`❌ Error crawling for agent ${agentId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Crawl a single page
   * @param {string} url - URL to crawl
   * @returns {Object|null} Crawled content or null if failed
   */
  async crawlWithLangChain(url) {
    if (this.crawledPages.has(url)) {
      return null; // Already crawled
    }

    try {
      let loader;
      
      // Choose loader based on configuration
      if (this.options.usePlaywright) {
        // Use Playwright for JavaScript-heavy sites
        loader = new PlaywrightWebBaseLoader(url, {
          launchOptions: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          },
          gotoOptions: {
            waitUntil: 'networkidle',
            timeout: 30000
          }
        });
      } else {
        // Use RecursiveUrlLoader for standard crawling
        loader = new RecursiveUrlLoader(url, {
          maxDepth: this.options.maxDepth,
          excludeDirs: this.options.excludeDirs,
          timeout: 30000,
          preventOutside: true
        });
      }

      // Load documents
      const documents = await loader.load();
      
      if (!documents || documents.length === 0) {
        console.warn(`No content found for ${url}`);
        return null;
      }

      // Process the first document (main page content)
      const doc = documents[0];
      const content = this.processLangChainDocument(doc, url);
      
      if (content && content.content.length >= this.options.minContentLength) {
        this.crawledPages.add(url);
        return content;
      }

      return null;

    } catch (error) {
      console.warn(`Failed to crawl ${url} with LangChain:`, error.message);
      return null;
    }
  }

  /**
   * Process a LangChain document into our content format
   * @param {Document} doc - LangChain document
   * @param {string} url - Original URL
   * @returns {Object} Processed content
   */
  processLangChainDocument(doc, url) {
    try {
      const content = doc.pageContent || '';
      const metadata = doc.metadata || {};
      
      // Extract title from metadata or content
      let title = metadata.title || this.extractTitleFromContent(content);
      if (!title) {
        title = this.extractTitleFromUrl(url);
      }

      // Categorize content
      const category = this.categorizeContent(url, title, content);

      // Clean content
      const cleanedContent = this.cleanContent(content);

      return {
        url,
        title,
        content: cleanedContent,
        category,
        metadata: {
          ...metadata,
          crawledAt: new Date().toISOString(),
          contentLength: cleanedContent.length,
          source: 'langchain-crawler'
        }
      };

    } catch (error) {
      console.error(`Error processing LangChain document for ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Extract title from content
   * @param {string} content - Page content
   * @returns {string} Extracted title
   */
  extractTitleFromContent(content) {
    try {
      // Look for title patterns in content
      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        return titleMatch[1].trim();
      }

      // Look for h1 tags
      const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match) {
        return h1Match[1].trim();
      }

      // Extract first meaningful line
      const lines = content.split('\n').filter(line => line.trim().length > 10);
      if (lines.length > 0) {
        return lines[0].trim().substring(0, 100);
      }

      return 'Untitled';
    } catch (error) {
      return 'Untitled';
    }
  }

  /**
   * Extract title from URL
   * @param {string} url - URL
   * @returns {string} Extracted title
   */
  extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split('/').filter(seg => seg.length > 0);
      
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        return lastSegment.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');
      }
      
      return urlObj.hostname;
    } catch (error) {
      return 'Untitled';
    }
  }

  /**
   * Update agent's knowledge base with crawled content
   * @param {Object} agent - Agent document
   * @param {Array} crawledContent - Array of crawled content
   */
  async processWithNLPPipeline(agent, crawledContent) {
    try {
      console.log(`🔄 Processing ${crawledContent.length} crawled pages through NLP pipeline for agent ${agent.agentId}`);
      
      // Process through complete NLP pipeline: chunk → embed → store vectors
      const result = await this.nlpPipeline.processCrawledContent(
        agent.agentId,
        agent.companyId,
        crawledContent
      );

      // Update agent's basic knowledge base with summary info
      const summaryItems = crawledContent.map(item => ({
        type: 'url',
        content: `Content from ${item.url}: ${item.title}`,
        metadata: {
          url: item.url,
          title: item.title,
          category: item.category,
          source: 'crawled-url',
          processed: true,
          chunks: 'stored-as-vectors',
          ...item.metadata
        }
      }));

      // Update agent in database with summary
      await Agent.updateOne(
        { agentId: agent.agentId, companyId: agent.companyId },
        { 
          knowledgeBase: [...(agent.knowledgeBase || []), ...summaryItems],
          updatedAt: new Date()
        }
      );

      console.log(`📚 NLP Pipeline completed for agent ${agent.agentId}:`, {
        totalChunks: result.totalChunks,
        totalVectors: result.totalVectors,
        processingTime: `${result.processingTime}ms`
      });

      return result;

    } catch (error) {
      console.error(`❌ Error processing with NLP pipeline:`, error.message);
      throw error;
    }
  }

  /**
   * Extract title from HTML
   * @param {Object} $ - Cheerio instance
   * @returns {string} Page title
   */
  extractTitle($) {
    let title = $('title').text().trim();
    
    if (!title) {
      title = $('h1').first().text().trim();
    }
    
    if (!title) {
      title = $('meta[property="og:title"]').attr('content') || '';
    }
    
    return title || 'Untitled Page';
  }

  /**
   * Extract main content from HTML
   * @param {Object} $ - Cheerio instance
   * @returns {string} Extracted content
   */
  extractContent($) {
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .sidebar').remove();
    
    // Try to find main content areas
    let content = '';
    
    // Common content selectors
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.main-content',
      '.post-content',
      '.entry-content',
      '#content',
      '.container',
      'body'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        if (content.trim().length > 100) {
          break;
        }
      }
    }
    
    // Fallback to all text
    if (!content || content.trim().length < 100) {
      content = $('body').text();
    }
    
    return content;
  }

  /**
   * Categorize content based on URL and content
   * @param {string} url - Page URL
   * @param {string} title - Page title
   * @param {string} content - Page content
   * @returns {string} Content category
   */
  categorizeContent(url, title, content) {
    const urlLower = url.toLowerCase();
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (urlLower.includes('help') || urlLower.includes('support') || titleLower.includes('help')) {
      return 'help';
    }
    
    if (urlLower.includes('docs') || urlLower.includes('documentation') || titleLower.includes('docs')) {
      return 'documentation';
    }
    
    if (urlLower.includes('faq') || titleLower.includes('faq') || contentLower.includes('frequently asked')) {
      return 'faq';
    }
    
    if (urlLower.includes('blog') || urlLower.includes('news') || titleLower.includes('blog')) {
      return 'blog';
    }
    
    if (urlLower.includes('about') || titleLower.includes('about')) {
      return 'about';
    }
    
    return 'general';
  }

  /**
   * Clean and normalize content
   * @param {string} content - Raw content
   * @returns {string} Cleaned content
   */
  cleanContent(content) {
    if (!content || typeof content !== 'string') {
      return '';
    }

    // Strip HTML markup using Cheerio
    const $ = cheerio.load(content);
    const textContent = $.text();
    
    return textContent
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
  }

  /**
   * Add delay between requests
   */
  async delayRequest() {
    return new Promise(resolve => setTimeout(resolve, this.options.delay));
  }

  /**
   * Clear crawled pages cache
   */
  clearCache() {
    this.crawledPages.clear();
  }

  /**
   * Search agent's knowledge base using semantic search
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Array of similar content with scores
   */
  async searchKnowledgeBase(agentId, companyId, query, options = {}) {
    try {
      console.log(`🔍 Searching knowledge base for agent ${agentId}: "${query}"`);
      
      const results = await this.nlpPipeline.searchSimilar(
        agentId,
        companyId,
        query,
        options
      );

      console.log(`✅ Found ${results.length} similar results for query: "${query}"`);
      return results;

    } catch (error) {
      console.error(`❌ Error searching knowledge base:`, error.message);
      throw error;
    }
  }

  /**
   * Get knowledge base statistics for an agent
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @returns {Object} Knowledge base statistics
   */
  async getKnowledgeBaseStats(agentId, companyId) {
    try {
      const stats = await this.nlpPipeline.getKnowledgeBaseStats(agentId, companyId);
      console.log(`📊 Knowledge base stats for agent ${agentId}:`, stats);
      return stats;

    } catch (error) {
      console.error(`❌ Error getting knowledge base stats:`, error.message);
      throw error;
    }
  }

  /**
   * Clear agent's knowledge base
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @param {Object} options - Clear options
   * @returns {Object} Clear results
   */
  async clearKnowledgeBase(agentId, companyId, options = {}) {
    try {
      console.log(`🗑️ Clearing knowledge base for agent ${agentId}`);
      
      const result = await this.nlpPipeline.clearKnowledgeBase(agentId, companyId, options);
      
      // Also clear from agent's basic knowledge base
      await Agent.updateOne(
        { agentId, companyId },
        { 
          knowledgeBase: [],
          updatedAt: new Date()
        }
      );

      console.log(`✅ Cleared knowledge base for agent ${agentId}: ${result.deletedCount} vectors`);
      return result;

    } catch (error) {
      console.error(`❌ Error clearing knowledge base:`, error.message);
      throw error;
    }
  }

  /**
   * Get crawling statistics
   * @returns {Object} Crawling stats
   */
  getStats() {
    return {
      crawledPages: this.crawledPages.size,
      maxPages: this.options.maxPages,
      delay: this.options.delay,
      maxDepth: this.options.maxDepth,
      usePlaywright: this.options.usePlaywright,
      nlpPipeline: this.nlpPipeline.getConfig()
    };
  }
}

export default new AgentCrawlerService();
