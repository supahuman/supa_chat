import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

/**
 * ChunkingService - Handles text chunking using LangChain
 * Provides configurable text splitting for different content types
 */
class ChunkingService {
  constructor(options = {}) {
    this.options = {
      // Default chunking configuration
      chunkSize: options.chunkSize || 1000,
      chunkOverlap: options.chunkOverlap || 200,
      
      // Separators for different content types
      separators: options.separators || [
        "\n\n",  // Paragraph breaks
        "\n",    // Line breaks
        ". ",    // Sentence endings
        " ",     // Word boundaries
        ""       // Character level (fallback)
      ],
      
      // Content type specific settings
      preserveFormatting: options.preserveFormatting || false,
      keepSeparator: options.keepSeparator || false,
      
      ...options
    };

    // Initialize the text splitter
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
      separators: this.options.separators,
      keepSeparator: this.options.keepSeparator
    });
  }

  /**
   * Chunk text content into smaller pieces
   * @param {string} text - Text content to chunk
   * @param {Object} metadata - Metadata to attach to chunks
   * @returns {Array} Array of Document objects with chunked content
   */
  async chunkText(text, metadata = {}) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Text content is required and must be a string');
      }

      console.log(`🧩 Chunking text (${text.length} chars) with size: ${this.options.chunkSize}, overlap: ${this.options.chunkOverlap}`);

      // Clean and prepare text
      const cleanedText = this.cleanText(text);
      
      // Create initial document
      const document = new Document({
        pageContent: cleanedText,
        metadata: {
          ...metadata,
          originalLength: text.length,
          chunkedAt: new Date().toISOString(),
          chunkingStrategy: 'recursive-character'
        }
      });

      // Split the document into chunks
      const chunks = await this.textSplitter.splitDocuments([document]);

      // Add chunk-specific metadata
      const enrichedChunks = chunks.map((chunk, index) => ({
        ...chunk,
        metadata: {
          ...chunk.metadata,
          chunkIndex: index,
          totalChunks: chunks.length,
          chunkSize: chunk.pageContent.length
        }
      }));

      console.log(`✅ Created ${chunks.length} chunks from ${text.length} character text`);
      return enrichedChunks;

    } catch (error) {
      console.error('❌ Error chunking text:', error.message);
      throw error;
    }
  }

  /**
   * Chunk multiple texts in batch
   * @param {Array} texts - Array of text objects with content and metadata
   * @returns {Array} Array of all chunked documents
   */
  async chunkTexts(texts) {
    try {
      if (!Array.isArray(texts)) {
        throw new Error('Texts must be an array');
      }

      console.log(`🧩 Batch chunking ${texts.length} texts`);
      
      const allChunks = [];
      
      for (const textObj of texts) {
        const { content, metadata = {} } = textObj;
        const chunks = await this.chunkText(content, metadata);
        allChunks.push(...chunks);
      }

      console.log(`✅ Batch chunking complete: ${allChunks.length} total chunks from ${texts.length} texts`);
      return allChunks;

    } catch (error) {
      console.error('❌ Error in batch chunking:', error.message);
      throw error;
    }
  }

  /**
   * Clean and normalize text before chunking
   * @param {string} text - Raw text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    return text
      .replace(/\r\n/g, '\n')           // Normalize line endings
      .replace(/\r/g, '\n')             // Handle old Mac line endings
      .replace(/\n{3,}/g, '\n\n')       // Reduce multiple line breaks
      .replace(/[ \t]+/g, ' ')          // Normalize whitespace
      .trim();                          // Remove leading/trailing whitespace
  }

  /**
   * Get chunking statistics
   * @param {Array} chunks - Array of chunked documents
   * @returns {Object} Statistics about the chunking
   */
  getChunkingStats(chunks) {
    if (!Array.isArray(chunks)) {
      return { error: 'Invalid chunks array' };
    }

    const totalChunks = chunks.length;
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.pageContent.length, 0);
    const avgChunkSize = totalChunks > 0 ? Math.round(totalLength / totalChunks) : 0;
    const minChunkSize = Math.min(...chunks.map(chunk => chunk.pageContent.length));
    const maxChunkSize = Math.max(...chunks.map(chunk => chunk.pageContent.length));

    return {
      totalChunks,
      totalLength,
      avgChunkSize,
      minChunkSize,
      maxChunkSize,
      chunkingConfig: {
        chunkSize: this.options.chunkSize,
        chunkOverlap: this.options.chunkOverlap
      }
    };
  }

  /**
   * Update chunking configuration
   * @param {Object} newOptions - New chunking options
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // Reinitialize text splitter with new options
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
      separators: this.options.separators,
      keepSeparator: this.options.keepSeparator
    });

    console.log(`⚙️ Updated chunking config: size=${this.options.chunkSize}, overlap=${this.options.chunkOverlap}`);
  }

  /**
   * Get current configuration
   * @returns {Object} Current chunking configuration
   */
  getConfig() {
    return { ...this.options };
  }
}

export default ChunkingService;
