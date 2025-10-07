import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import csvParser from 'csv-parser';

// Lazy load pdf-parse to avoid initialization issues
let pdfParse = null;
const loadPdfParse = async () => {
  if (!pdfParse) {
    try {
      pdfParse = (await import('pdf-parse')).default;
    } catch (error) {
      console.error('Failed to load pdf-parse:', error);
      throw new Error('PDF parsing not available');
    }
  }
  return pdfParse;
};

/**
 * DocumentProcessingService - Handles file parsing and text extraction
 * Supports multiple document formats: PDF, DOC, DOCX, TXT, MD, CSV
 */
class DocumentProcessingService {
  constructor(options = {}) {
    this.options = {
      // File size limits
      maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
      
      // Supported file types
      supportedTypes: options.supportedTypes || [
        'pdf', 'doc', 'docx', 'txt', 'md', 'csv'
      ],
      
      // Text processing options
      preserveFormatting: options.preserveFormatting || false,
      removeEmptyLines: options.removeEmptyLines !== false,
      normalizeWhitespace: options.normalizeWhitespace !== false,
      
      ...options
    };

    this.log('🚀 DocumentProcessingService initialized', {
      maxFileSize: this.options.maxFileSize,
      supportedTypes: this.options.supportedTypes
    });
  }

  /**
   * Process uploaded file and extract text content
   * @param {Object} file - Multer file object
   * @param {Object} options - Processing options
   * @returns {Object} Processing result with extracted text and metadata
   */
  async processFile(file, options = {}) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file
      this.validateFile(file);

      // Get file extension
      const fileExt = this.getFileExtension(file.originalname);
      
      this.log(`📄 Processing ${fileExt.toUpperCase()} file: ${file.originalname}`, {
        size: file.size,
        mimetype: file.mimetype
      });

      // Extract text based on file type
      let extractedText;
      let metadata = {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: fileExt,
        mimetype: file.mimetype,
        processedAt: new Date()
      };

      switch (fileExt.toLowerCase()) {
        case 'pdf':
          extractedText = await this.extractFromPDF(file);
          break;
        case 'doc':
        case 'docx':
          extractedText = await this.extractFromWord(file);
          break;
        case 'txt':
        case 'md':
          extractedText = await this.extractFromText(file);
          break;
        case 'csv':
          extractedText = await this.extractFromCSV(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExt}`);
      }

      // Clean and normalize text
      const cleanedText = this.cleanText(extractedText, options);

      // Add processing metadata
      metadata.textLength = cleanedText.length;
      metadata.originalTextLength = extractedText.length;
      metadata.cleaningApplied = {
        removeEmptyLines: this.options.removeEmptyLines,
        normalizeWhitespace: this.options.normalizeWhitespace
      };

      this.log(`✅ Successfully processed ${file.originalname}`, {
        originalLength: extractedText.length,
        cleanedLength: cleanedText.length,
        fileType: fileExt
      });

      return {
        success: true,
        text: cleanedText,
        metadata,
        originalText: extractedText
      };

    } catch (error) {
      this.log(`❌ Error processing file ${file?.originalname}:`, error.message);
      return {
        success: false,
        error: error.message,
        metadata: {
          fileName: file?.originalname,
          fileSize: file?.size,
          processedAt: new Date(),
          error: error.message
        }
      };
    }
  }

  /**
   * Extract text from PDF file
   * @param {Object} file - Multer file object
   * @returns {string} Extracted text
   */
  async extractFromPDF(file) {
    try {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfParseLib = await loadPdfParse();
      const pdfData = await pdfParseLib(dataBuffer);
      
      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      return pdfData.text;
    } catch (error) {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }

  /**
   * Extract text from Word document (DOC/DOCX)
   * @param {Object} file - Multer file object
   * @returns {string} Extracted text
   */
  async extractFromWord(file) {
    try {
      const dataBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text content found in Word document');
      }

      // Log any conversion warnings
      if (result.messages && result.messages.length > 0) {
        this.log('⚠️ Word document conversion warnings:', result.messages);
      }

      return result.value;
    } catch (error) {
      throw new Error(`Word document processing failed: ${error.message}`);
    }
  }

  /**
   * Extract text from plain text file (TXT/MD)
   * @param {Object} file - Multer file object
   * @returns {string} Extracted text
   */
  async extractFromText(file) {
    try {
      const text = fs.readFileSync(file.path, 'utf8');
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in file');
      }

      return text;
    } catch (error) {
      throw new Error(`Text file processing failed: ${error.message}`);
    }
  }

  /**
   * Extract text from CSV file
   * @param {Object} file - Multer file object
   * @returns {string} Extracted text
   */
  async extractFromCSV(file) {
    return new Promise((resolve, reject) => {
      try {
        const results = [];
        const textParts = [];

        fs.createReadStream(file.path)
          .pipe(csvParser())
          .on('data', (data) => {
            results.push(data);
            // Convert each row to readable text
            const rowText = Object.entries(data)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            textParts.push(rowText);
          })
          .on('end', () => {
            if (textParts.length === 0) {
              reject(new Error('No data found in CSV file'));
              return;
            }

            // Combine all rows into readable text
            const csvText = textParts.join('\n');
            resolve(csvText);
          })
          .on('error', (error) => {
            reject(new Error(`CSV processing failed: ${error.message}`));
          });
      } catch (error) {
        reject(new Error(`CSV processing failed: ${error.message}`));
      }
    });
  }

  /**
   * Clean and normalize extracted text
   * @param {string} text - Raw extracted text
   * @param {Object} options - Cleaning options
   * @returns {string} Cleaned text
   */
  cleanText(text, options = {}) {
    if (!text) return '';

    let cleanedText = text;

    // Remove empty lines if requested
    if (this.options.removeEmptyLines || options.removeEmptyLines) {
      cleanedText = cleanedText.replace(/^\s*[\r\n]/gm, '');
    }

    // Normalize whitespace if requested
    if (this.options.normalizeWhitespace || options.normalizeWhitespace) {
      // Replace multiple spaces with single space
      cleanedText = cleanedText.replace(/\s+/g, ' ');
      // Replace multiple newlines with double newline
      cleanedText = cleanedText.replace(/\n\s*\n\s*\n+/g, '\n\n');
    }

    // Remove leading/trailing whitespace
    cleanedText = cleanedText.trim();

    return cleanedText;
  }

  /**
   * Validate uploaded file
   * @param {Object} file - Multer file object
   */
  validateFile(file) {
    if (!file.originalname) {
      throw new Error('File name is required');
    }

    if (!file.path) {
      throw new Error('File path is required');
    }

    if (file.size > this.options.maxFileSize) {
      throw new Error(`File size exceeds limit of ${this.options.maxFileSize} bytes`);
    }

    const fileExt = this.getFileExtension(file.originalname);
    if (!this.options.supportedTypes.includes(fileExt.toLowerCase())) {
      throw new Error(`Unsupported file type: ${fileExt}. Supported types: ${this.options.supportedTypes.join(', ')}`);
    }
  }

  /**
   * Get file extension from filename
   * @param {string} filename - File name
   * @returns {string} File extension
   */
  getFileExtension(filename) {
    return path.extname(filename).toLowerCase().slice(1);
  }

  /**
   * Clean up temporary file
   * @param {string} filePath - Path to temporary file
   */
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.log(`🗑️ Cleaned up temporary file: ${filePath}`);
      }
    } catch (error) {
      this.log(`⚠️ Failed to cleanup file ${filePath}:`, error.message);
    }
  }

  /**
   * Log message with service prefix
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  log(message, data = null) {
    if (this.options.enableLogging !== false) {
      console.log(`[DocumentProcessingService] ${message}`, data || '');
    }
  }
}

export default DocumentProcessingService;
