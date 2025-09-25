import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';

class WebCrawlerService {
  constructor() {
    this.baseUrl = 'https://www.africanvibes.net';
    this.helpCenterUrl = `${this.baseUrl}/help-center`;
    this.crawledPages = new Set();
    this.extractedContent = [];
  }

  async crawlHelpCenter() {
    try {
      console.log('🕷️ Starting to crawl African Vibes help center...');

      // Start with the main help center page
      const mainPageContent = await this.crawlPage(this.helpCenterUrl);
      if (mainPageContent) {
        this.extractedContent.push(mainPageContent);
      }

      // Find and crawl all FAQ sections
      const faqLinks = await this.findFAQLinks(this.helpCenterUrl);
      console.log(`📋 Found ${faqLinks.length} FAQ sections to crawl`);

      for (const link of faqLinks) {
        const content = await this.crawlPage(link);
        if (content) {
          this.extractedContent.push(content);
        }
        // Small delay to be respectful to the server
        await this.delay(1000);
      }

      console.log(
        `✅ Crawling completed. Extracted ${this.extractedContent.length} content sections`
      );
      return {
        success: true,
        content: this.extractedContent,
        count: this.extractedContent.length,
      };
    } catch (error) {
      console.error('❌ Crawling failed:', error);
      return {
        success: false,
        error: error.message,
        content: [],
      };
    }
  }

  async crawlPage(url) {
    if (this.crawledPages.has(url)) {
      return null; // Already crawled
    }

    try {
      console.log(`🕷️ Crawling: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; AfricanVibesBot/1.0; +https://www.africanvibes.net)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
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
          source: 'help-center',
          crawledAt: new Date().toISOString(),
          wordCount: content.split(' ').length,
        },
      };
    } catch (error) {
      console.warn(`⚠️ Failed to crawl ${url}:`, error.message);
      return null;
    }
  }

  async findFAQLinks(helpCenterUrl) {
    try {
      const response = await fetch(helpCenterUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; AfricanVibesBot/1.0; +https://www.africanvibes.net)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const links = new Set();

      // Find FAQ links in various formats
      $('a[href*="faq"], a[href*="help"], a[href*="support"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http')) {
          links.add(new URL(href, this.baseUrl).href);
        }
      });

      // Find links in FAQ sections
      $(
        '.faq, .help, .support, [class*="faq"], [class*="help"], [class*="support"]'
      )
        .find('a')
        .each((i, el) => {
          const href = $(el).attr('href');
          if (href && !href.startsWith('http')) {
            links.add(new URL(href, this.baseUrl).href);
          }
        });

      return Array.from(links);
    } catch (error) {
      console.warn('⚠️ Failed to find FAQ links:', error.message);
      return [];
    }
  }

  extractTitle($) {
    // Try multiple selectors for title
    const selectors = [
      'h1',
      '.page-title',
      '.content-title',
      '[class*="title"]',
      'title',
    ];

    for (const selector of selectors) {
      const title = $(selector).first().text().trim();
      if (title && title.length > 0) {
        return title;
      }
    }

    return 'Help Center Content';
  }

  extractContent($) {
    // Remove unwanted elements
    $(
      'script, style, nav, header, footer, .nav, .header, .footer, .sidebar, .menu'
    ).remove();

    // Focus on main content areas
    const contentSelectors = [
      '.content',
      '.main-content',
      '.help-content',
      '.faq-content',
      'main',
      'article',
      '.container',
      'body',
    ];

    let content = '';

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        if (content.length > 100) {
          break;
        }
      }
    }

    // If no specific content area found, get all text
    if (!content || content.length < 100) {
      content = $('body').text();
    }

    return content;
  }

  cleanContent(content) {
    return content
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .replace(/\t+/g, ' ') // Replace tabs with spaces
      .trim();
  }

  categorizeContent(url, title, content) {
    const text = `${url} ${title} ${content}`.toLowerCase();

    if (
      text.includes('payment') ||
      text.includes('refund') ||
      text.includes('money')
    ) {
      return 'payments';
    } else if (
      text.includes('event') ||
      text.includes('host') ||
      text.includes('create')
    ) {
      return 'events';
    } else if (
      text.includes('ticket') ||
      text.includes('buy') ||
      text.includes('purchase')
    ) {
      return 'tickets';
    } else if (
      text.includes('account') ||
      text.includes('sign') ||
      text.includes('login')
    ) {
      return 'account';
    } else if (
      text.includes('support') ||
      text.includes('help') ||
      text.includes('contact')
    ) {
      return 'support';
    } else if (
      text.includes('policy') ||
      text.includes('terms') ||
      text.includes('privacy')
    ) {
      return 'policies';
    } else {
      return 'general';
    }
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Extract specific FAQ content
  async extractFAQContent($) {
    const faqs = [];

    // Look for FAQ patterns
    $('.faq, .faq-item, [class*="faq"]').each((i, el) => {
      const question = $(el)
        .find('.question, .faq-question, h3, h4')
        .first()
        .text()
        .trim();
      const answer = $(el).find('.answer, .faq-answer, p').text().trim();

      if (question && answer) {
        faqs.push({
          question,
          answer,
          category: this.categorizeContent('', question, answer),
        });
      }
    });

    return faqs;
  }

  // Get crawling statistics
  getStats() {
    return {
      crawledPages: this.crawledPages.size,
      extractedContent: this.extractedContent.length,
      totalWords: this.extractedContent.reduce(
        (sum, item) => sum + item.metadata.wordCount,
        0
      ),
      categories: this.extractedContent.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  // Clear crawled data
  clearData() {
    this.crawledPages.clear();
    this.extractedContent = [];
  }
}

export default new WebCrawlerService();
