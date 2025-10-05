import * as cheerio from 'cheerio';
import Agent from '../models/Agent.js';

class AgentCrawlerService {
  constructor() {
    this.crawledPages = new Set();
    this.maxPages = 50;
    this.delay = 1000; // 1 second delay between requests
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

      // Crawl each URL
      for (const url of urls) {
        try {
          console.log(`🕷️ Crawling: ${url}`);
          
          const content = await this.crawlPage(url);
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

      // Update agent's knowledge base with crawled content
      if (crawledContent.length > 0) {
        await this.updateAgentKnowledgeBase(agent, crawledContent);
        console.log(`✅ Updated agent ${agentId} with ${crawledContent.length} crawled pages`);
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
  async crawlPage(url) {
    if (this.crawledPages.has(url)) {
      return null; // Already crawled
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SupaChatBot/1.0; +https://supachatbot.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      this.crawledPages.add(url);

      const $ = cheerio.load(html);

      // Extract main content
      const title = this.extractTitle($);
      const content = this.extractContent($);
      const category = this.categorizeContent(url, title, content);

      if (!content || content.trim().length < 50) {
        return null; // Skip pages with minimal content
      }

      return {
        url,
        title,
        content: this.cleanContent(content),
        category,
        metadata: {
          source: 'web-crawler',
          crawledAt: new Date().toISOString(),
          wordCount: content.split(' ').length,
          status: 'processed'
        },
      };
    } catch (error) {
      console.warn(`⚠️ Failed to crawl ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Update agent's knowledge base with crawled content
   * @param {Object} agent - Agent document
   * @param {Array} crawledContent - Array of crawled content
   */
  async updateAgentKnowledgeBase(agent, crawledContent) {
    try {
      // Convert crawled content to knowledge base format
      const newKnowledgeItems = crawledContent.map(item => ({
        type: 'url',
        content: item.content,
        metadata: {
          url: item.url,
          title: item.title,
          category: item.category,
          ...item.metadata
        }
      }));

      // Add to existing knowledge base
      const updatedKnowledgeBase = [...(agent.knowledgeBase || []), ...newKnowledgeItems];

      // Update agent in database
      await Agent.updateOne(
        { agentId: agent.agentId, companyId: agent.companyId },
        { 
          knowledgeBase: updatedKnowledgeBase,
          updatedAt: new Date()
        }
      );

      console.log(`📚 Updated agent ${agent.agentId} knowledge base with ${newKnowledgeItems.length} new items`);
    } catch (error) {
      console.error(`❌ Error updating agent knowledge base:`, error.message);
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
    return content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
  }

  /**
   * Add delay between requests
   */
  async delayRequest() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  /**
   * Clear crawled pages cache
   */
  clearCache() {
    this.crawledPages.clear();
  }

  /**
   * Get crawling statistics
   * @returns {Object} Crawling stats
   */
  getStats() {
    return {
      crawledPages: this.crawledPages.size,
      maxPages: this.maxPages,
      delay: this.delay
    };
  }
}

export default new AgentCrawlerService();
