class ChunkingService {
  constructor() {
    this.maxChunkSize = 500; // Maximum characters per chunk
    this.overlapSize = 100; // Overlap between chunks for context
  }

  // Split markdown content into chunks
  chunkMarkdown(content) {
    const sections = this.splitIntoSections(content);
    const chunks = [];

    sections.forEach((section) => {
      const sectionChunks = this.chunkSection(section);
      chunks.push(...sectionChunks);
    });

    return chunks;
  }

  // Split content into logical sections based on headers
  splitIntoSections(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = { title: '', content: '', level: 0 };

    lines.forEach((line) => {
      if (line.startsWith('#')) {
        // Save previous section if it has content
        if (currentSection.content.trim()) {
          sections.push(currentSection);
        }

        // Start new section
        const level = line.match(/^#+/)[0].length;
        const title = line.replace(/^#+\s*/, '').trim();
        currentSection = { title, content: line + '\n', level };
      } else {
        // Add line to current section
        currentSection.content += line + '\n';
      }
    });

    // Add the last section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    return sections;
  }

  // Chunk a section into smaller pieces
  chunkSection(section) {
    const chunks = [];
    const content = section.content;

    if (content.length <= this.maxChunkSize) {
      // Section is small enough, keep as one chunk
      chunks.push({
        content: content.trim(),
        title: section.title,
        level: section.level,
        metadata: {
          category: this.getCategoryFromTitle(section.title),
          source: 'knowledge-base',
          section: section.title,
        },
      });
    } else {
      // Split into multiple chunks
      const paragraphs = this.splitIntoParagraphs(content);
      let currentChunk = '';
      let chunkIndex = 0;

      paragraphs.forEach((paragraph) => {
        if (
          (currentChunk + paragraph).length > this.maxChunkSize &&
          currentChunk
        ) {
          // Save current chunk
          chunks.push({
            content: currentChunk.trim(),
            title: section.title,
            level: section.level,
            metadata: {
              category: this.getCategoryFromTitle(section.title),
              source: 'knowledge-base',
              section: section.title,
              chunkIndex: chunkIndex++,
            },
          });

          // Start new chunk with overlap
          const overlap = this.getOverlap(currentChunk);
          currentChunk = overlap + paragraph;
        } else {
          currentChunk += paragraph;
        }
      });

      // Add the last chunk
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          title: section.title,
          level: section.level,
          metadata: {
            category: this.getCategoryFromTitle(section.title),
            source: 'knowledge-base',
            section: section.title,
            chunkIndex: chunkIndex,
          },
        });
      }
    }

    return chunks;
  }

  // Split content into paragraphs
  splitIntoParagraphs(content) {
    return content.split('\n\n').filter((p) => p.trim());
  }

  // Get overlap from previous chunk
  getOverlap(chunk) {
    if (chunk.length <= this.overlapSize) {
      return chunk;
    }
    return chunk.slice(-this.overlapSize);
  }

  // Get category from title
  getCategoryFromTitle(title) {
    const titleLower = title.toLowerCase();

    if (
      titleLower.includes('account') ||
      titleLower.includes('sign') ||
      titleLower.includes('login')
    ) {
      return 'account';
    } else if (
      titleLower.includes('event') ||
      titleLower.includes('host') ||
      titleLower.includes('create')
    ) {
      return 'events';
    } else if (
      titleLower.includes('ticket') ||
      titleLower.includes('buy') ||
      titleLower.includes('purchase')
    ) {
      return 'tickets';
    } else if (
      titleLower.includes('payment') ||
      titleLower.includes('refund') ||
      titleLower.includes('money')
    ) {
      return 'payments';
    } else if (
      titleLower.includes('support') ||
      titleLower.includes('help') ||
      titleLower.includes('contact')
    ) {
      return 'support';
    } else if (
      titleLower.includes('privacy') ||
      titleLower.includes('security') ||
      titleLower.includes('policy')
    ) {
      return 'policies';
    } else {
      return 'general';
    }
  }

  // Process and chunk a file
  async processFile(filePath) {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      return this.chunkMarkdown(content);
    } catch (error) {
      console.error('Error processing file:', error);
      return [];
    }
  }
}

export default new ChunkingService();
