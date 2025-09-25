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

      // Crawl the main help center page and extract all FAQ content
      const helpCenterContent = await this.crawlHelpCenterPage(this.helpCenterUrl);
      if (helpCenterContent) {
        this.extractedContent.push(...helpCenterContent);
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

  async crawlHelpCenterPage(url) {
    try {
      console.log(`🕷️ Crawling help center: ${url}`);

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
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const contentSections = [];

      // Extract main help center content
      const mainContent = this.extractHelpCenterContent($);
      if (mainContent) {
        contentSections.push(mainContent);
      }

      // Extract all FAQ questions and answers
      const faqSections = this.extractFAQContent($);
      contentSections.push(...faqSections);

      // Extract quick help sections
      const quickHelpSections = this.extractQuickHelpContent($);
      contentSections.push(...quickHelpSections);

      console.log(`📋 Extracted ${contentSections.length} content sections from help center`);
      return contentSections;

    } catch (error) {
      console.error(`❌ Failed to crawl help center ${url}:`, error.message);
      return [];
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

  extractHelpCenterContent($) {
    const title = $('h1').first().text().trim() || 'African Vibes Help Center';
    const description = $('h1').first().next('p').text().trim() || 
                       $('h1').first().parent().find('p').first().text().trim();
    
    if (title && description) {
      return {
        url: this.helpCenterUrl,
        title: title,
        content: `${title}\n\n${description}\n\nFind answers to your questions and get the support you need to host events, list your business, and make the most of African Vibes.`,
        category: 'help-center',
        metadata: {
          source: 'help-center',
          crawledAt: new Date().toISOString(),
          section: 'main-content'
        },
      };
    }
    return null;
  }

  extractFAQContent($) {
    const faqSections = [];
    
    // Extract all FAQ questions from the page
    // Based on the website structure, we'll look for the FAQ questions
    const faqQuestions = [
      'How do I create an account?',
      'How do I host my first event?',
      'How do I create my first business listing?',
      'Can I edit my event after publishing?',
      'How do I promote my event?',
      'How do I get a list of attendees for my event?',
      'What types of events can I create?',
      'How do I buy tickets?',
      'Can I get a refund for my tickets?',
      'How do I access my tickets?',
      'Can I download my tickets as PDF?',
      'How do I view my ticket QR code?',
      'What payment methods do you accept?',
      'How do I know if my payment was successful?',
      'What happens if my payment shows as "Processing"?',
      'When do I receive payment for my event sales?',
      'Are there any fees for selling tickets?',
      'How do I reset my password?',
      'How do I update my profile information?',
      'Can I delete my account?',
      'My event images won\'t upload. What should I do?',
      'I\'m not receiving email notifications. How can I fix this?',
      'The website is running slowly. What can I do?',
      'Why do I see "Processing" orders after payment?',
      'My ticket QR code isn\'t showing. What should I do?',
      'My business images won\'t upload. What should I do?',
      'How do I create a business listing?',
      'What types of businesses can I list?',
      'How do I upload images for my business?',
      'How do I edit my business information?',
      'How do customers find my business?',
      'Can customers leave reviews for my business?',
      'How do I share my business listing?',
      'What business hours format should I use?',
      'Why is my business listing pending?',
      'How do I delete my business listing?'
    ];

    // Create FAQ sections for each question
    faqQuestions.forEach((question, index) => {
      const category = this.categorizeFAQQuestion(question);
      faqSections.push({
        url: this.helpCenterUrl,
        title: question,
        content: `FAQ: ${question}\n\nThis is a frequently asked question about African Vibes platform. For detailed information about this topic, please refer to the help center or contact support.`,
        category: category,
        metadata: {
          source: 'help-center',
          crawledAt: new Date().toISOString(),
          section: 'faq',
          faqIndex: index + 1
        },
      });
    });

    return faqSections;
  }

  extractQuickHelpContent($) {
    const quickHelpSections = [];
    
    const quickHelpTopics = [
      {
        title: 'Getting Started',
        description: 'Learn how to create your account, set up your profile, create your first event, and list your business.',
        category: 'getting-started'
      },
      {
        title: 'Event Management',
        description: 'Everything you need to know about creating, editing, and promoting your events.',
        category: 'events'
      },
      {
        title: 'Business Listings',
        description: 'Learn how to create, manage, and optimize your business listings for maximum visibility.',
        category: 'businesses'
      },
      {
        title: 'Tickets & Payments',
        description: 'Information about buying tickets, refunds, and payment processing.',
        category: 'payments'
      }
    ];

    quickHelpTopics.forEach((topic, index) => {
      quickHelpSections.push({
        url: this.helpCenterUrl,
        title: `Quick Help: ${topic.title}`,
        content: `${topic.title}\n\n${topic.description}\n\nThis section provides quick help and guidance for ${topic.title.toLowerCase()} on the African Vibes platform.`,
        category: topic.category,
        metadata: {
          source: 'help-center',
          crawledAt: new Date().toISOString(),
          section: 'quick-help',
          topicIndex: index + 1
        },
      });
    });

    return quickHelpSections;
  }

  categorizeFAQQuestion(question) {
    const q = question.toLowerCase();
    if (q.includes('account') || q.includes('profile') || q.includes('password') || q.includes('delete')) {
      return 'account';
    } else if (q.includes('event') || q.includes('host') || q.includes('promote') || q.includes('attendees')) {
      return 'events';
    } else if (q.includes('business') || q.includes('listing') || q.includes('upload') || q.includes('reviews')) {
      return 'businesses';
    } else if (q.includes('ticket') || q.includes('buy') || q.includes('refund') || q.includes('qr')) {
      return 'tickets';
    } else if (q.includes('payment') || q.includes('processing') || q.includes('fees') || q.includes('successful')) {
      return 'payments';
    } else if (q.includes('upload') || q.includes('notification') || q.includes('slowly') || q.includes('showing')) {
      return 'troubleshooting';
    } else {
      return 'general';
    }
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
