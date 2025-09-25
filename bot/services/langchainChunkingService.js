import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import csv from 'csv-parser';

class LangChainChunkingService {
  constructor(options = {}) {
    this.options = {
      // Chunking configuration
      chunkSize: options.chunkSize || 1000,
      chunkOverlap: options.chunkOverlap || 200,
      
      // Document processing options
      separators: options.separators || ["\n\n", "\n", ". ", " ", ""],
      
      // Metadata extraction
      extractMetadata: options.extractMetadata !== false,
      
      // File type support
      supportedTypes: options.supportedTypes || [
        'txt', 'md', 'pdf', 'docx', 'csv', 'json', 'html'
      ],
      
      // Custom processing options
      preserveFormatting: options.preserveFormatting || false,
      extractTables: options.extractTables || true,
      extractImages: options.extractImages || false,
      
      // Embedding configuration
      embeddingProvider: options.embeddingProvider || process.env.EMBEDDING_PROVIDER || 'openai',
      
      ...options
    };

    // Initialize text splitter
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
      separators: this.options.separators
    });

    // Initialize embedding model
    this.embeddings = this.initializeEmbeddings();
  }

      initializeEmbeddings() {
        const provider = this.options.embeddingProvider;
        
        if (provider === 'openai' || !provider) {
          return new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
          });
        }
        
        console.warn(`Embedding provider ${provider} not supported yet, falling back to OpenAI`);
        return new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: 'text-embedding-3-small',
        });
      }

  /**
   * Main method to process any document type
   */
  async processDocument(filePath, options = {}) {
    try {
      const fileExtension = path.extname(filePath).toLowerCase().slice(1);
      
      if (!this.options.supportedTypes.includes(fileExtension)) {
        throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      let content = '';
      let metadata = {};

      // Extract content based on file type
      switch (fileExtension) {
        case 'txt':
        case 'md':
          ({ content, metadata } = await this.processTextFile(filePath));
          break;
        case 'pdf':
          ({ content, metadata } = await this.processPdfFile(filePath));
          break;
        case 'docx':
          ({ content, metadata } = await this.processDocxFile(filePath));
          break;
        case 'csv':
          ({ content, metadata } = await this.processCsvFile(filePath));
          break;
        case 'json':
          ({ content, metadata } = await this.processJsonFile(filePath));
          break;
        case 'html':
          ({ content, metadata } = await this.processHtmlFile(filePath));
          break;
        default:
          throw new Error(`No processor for file type: ${fileExtension}`);
      }

      // Add file metadata
      const fileStats = await fs.stat(filePath);
      metadata = {
        ...metadata,
        fileName: path.basename(filePath),
        filePath: filePath,
        fileSize: fileStats.size,
        fileType: fileExtension,
        processedAt: new Date().toISOString(),
        ...options.metadata
      };

      // Create LangChain documents
      const documents = await this.textSplitter.createDocuments([content], [metadata]);
      
      // Convert to our format
      return documents.map((doc, index) => ({
        content: doc.pageContent,
        title: this.extractTitle(doc.pageContent, metadata),
        level: this.determineLevel(doc.pageContent),
        metadata: {
          ...doc.metadata,
          chunkIndex: index,
          category: this.categorizeContent(doc.pageContent, metadata),
          source: 'langchain-processing'
        }
      }));

    } catch (error) {
      console.error(`Error processing document ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Process multiple documents
   */
  async processDocuments(filePaths, options = {}) {
    const results = [];
    
    for (const filePath of filePaths) {
      try {
        const chunks = await this.processDocument(filePath, options);
        results.push(...chunks);
      } catch (error) {
        console.error(`Failed to process ${filePath}:`, error);
        if (options.continueOnError !== false) {
          continue;
        } else {
          throw error;
        }
      }
    }
    
    return results;
  }

  /**
   * Process text/markdown files
   */
  async processTextFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const metadata = {
      type: 'text',
      encoding: 'utf-8'
    };
    
    return { content, metadata };
  }

  /**
   * Process PDF files
   */
  async processPdfFile(filePath) {
    // Dynamic import to avoid initialization issues
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    
    const content = data.text;
    const metadata = {
      type: 'pdf',
      pages: data.numpages,
      info: data.info || {},
      version: data.version
    };
    
    return { content, metadata };
  }

  /**
   * Process Word documents
   */
  async processDocxFile(filePath) {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    
    const content = result.value;
    const metadata = {
      type: 'docx',
      messages: result.messages || []
    };
    
    return { content, metadata };
  }

  /**
   * Process CSV files
   */
  async processCsvFile(filePath) {
    return new Promise((resolve, reject) => {
      const rows = [];
      const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => {
          // Convert CSV to readable text format
          const headers = Object.keys(rows[0] || {});
          const content = [
            `CSV Data with ${rows.length} rows and ${headers.length} columns:`,
            `Headers: ${headers.join(', ')}`,
            '',
            ...rows.map((row, index) => 
              `Row ${index + 1}: ${headers.map(h => `${h}: ${row[h]}`).join(', ')}`
            )
          ].join('\n');
          
          const metadata = {
            type: 'csv',
            rowCount: rows.length,
            columnCount: headers.length,
            headers: headers
          };
          
          resolve({ content, metadata });
        })
        .on('error', reject);
    });
  }

  /**
   * Process JSON files
   */
  async processJsonFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Convert JSON to readable text
    const textContent = this.jsonToText(data);
    const metadata = {
      type: 'json',
      structure: this.analyzeJsonStructure(data)
    };
    
    return { content: textContent, metadata };
  }

  /**
   * Process HTML files
   */
  async processHtmlFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Simple HTML to text conversion (you might want to use cheerio for better parsing)
    const textContent = content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const metadata = {
      type: 'html',
      originalLength: content.length,
      textLength: textContent.length
    };
    
    return { content: textContent, metadata };
  }

  /**
   * Convert JSON to readable text
   */
  jsonToText(obj, prefix = '') {
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    if (obj === null) return 'null';
    
    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        `${prefix}Item ${index + 1}: ${this.jsonToText(item, prefix + '  ')}`
      ).join('\n');
    }
    
    if (typeof obj === 'object') {
      return Object.entries(obj).map(([key, value]) => 
        `${prefix}${key}: ${this.jsonToText(value, prefix + '  ')}`
      ).join('\n');
    }
    
    return String(obj);
  }

  /**
   * Analyze JSON structure
   */
  analyzeJsonStructure(obj) {
    if (Array.isArray(obj)) {
      return {
        type: 'array',
        length: obj.length,
        itemTypes: [...new Set(obj.map(item => typeof item))]
      };
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return {
        type: 'object',
        keys: Object.keys(obj),
        keyCount: Object.keys(obj).length
      };
    }
    
    return { type: typeof obj };
  }

  /**
   * Extract title from content
   */
  extractTitle(content, metadata) {
    // Try to extract title from markdown headers
    const headerMatch = content.match(/^#+\s*(.+)$/m);
    if (headerMatch) {
      return headerMatch[1].trim();
    }
    
    // Use filename as fallback
    return metadata.fileName || 'Untitled Document';
  }

  /**
   * Determine content level (for hierarchical organization)
   */
  determineLevel(content) {
    const headerMatch = content.match(/^(#+)/m);
    if (headerMatch) {
      return headerMatch[1].length;
    }
    return 1;
  }

  /**
   * Categorize content based on content and metadata
   */
  categorizeContent(content, metadata) {
    const contentLower = content.toLowerCase();
    const fileName = (metadata.fileName || '').toLowerCase();
    
    // File type based categorization
    if (metadata.fileType === 'pdf' && fileName.includes('manual')) {
      return 'documentation';
    }
    if (metadata.fileType === 'csv') {
      return 'data';
    }
    if (metadata.fileType === 'json') {
      return 'configuration';
    }
    
    // Content based categorization
    if (contentLower.includes('api') || contentLower.includes('endpoint')) {
      return 'api';
    }
    if (contentLower.includes('error') || contentLower.includes('troubleshoot')) {
      return 'support';
    }
    if (contentLower.includes('policy') || contentLower.includes('terms')) {
      return 'legal';
    }
    if (contentLower.includes('tutorial') || contentLower.includes('guide')) {
      return 'tutorial';
    }
    
    return 'general';
  }

  /**
   * Generate embeddings for documents using LangChain
   */
  async generateEmbeddings(documents) {
    if (!this.embeddings) {
      throw new Error('Embedding model not initialized');
    }

    try {
      const texts = documents.map(doc => doc.content);
      const embeddings = await this.embeddings.embedDocuments(texts);
      
      return documents.map((doc, index) => ({
        ...doc,
        embedding: embeddings[index]
      }));
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a single query
   */
  async generateQueryEmbedding(query) {
    if (!this.embeddings) {
      throw new Error('Embedding model not initialized');
    }

    try {
      const embedding = await this.embeddings.embedQuery(query);
      return embedding;
    } catch (error) {
      console.error('Error generating query embedding:', error);
      throw error;
    }
  }

  /**
   * Get embedding model information
   */
  getEmbeddingInfo() {
    return {
      provider: this.options.embeddingProvider,
      model: this.embeddings?.modelName || this.embeddings?.model || 'unknown',
      dimensions: this.embeddings?.dimensions || 'unknown'
    };
  }

  /**
   * Get supported file types
   */
  getSupportedTypes() {
    return [...this.options.supportedTypes];
  }

  /**
   * Update chunking configuration
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.options.chunkSize,
      chunkOverlap: this.options.chunkOverlap,
      separators: this.options.separators
    });
  }
}

export default LangChainChunkingService;
