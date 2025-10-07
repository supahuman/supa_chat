/**
 * QAProcessingService - Handles Q&A pair processing for knowledge base
 * Processes manually added Q&A pairs into vectors for semantic search
 */

class QAProcessingService {
  constructor() {
    console.log('❓ QAProcessingService initialized');
  }

  /**
   * Process Q&A pairs for vector storage
   * @param {Array} qaPairs - Array of Q&A objects
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @returns {Object} Processing result with chunks and metadata
   */
  async processQAPairs(qaPairs, agentId, companyId) {
    try {
      if (!qaPairs || qaPairs.length === 0) {
        console.log('📝 No Q&A pairs to process');
        return {
          success: true,
          totalChunks: 0,
          totalVectors: 0,
          processingTime: 0,
          qaPairs: []
        };
      }

      console.log(`❓ Processing ${qaPairs.length} Q&A pairs for agent ${agentId}`);

      const startTime = Date.now();
      const processedQAs = [];

      for (const qaPair of qaPairs) {
        try {
          const processedQA = await this.processSingleQA(qaPair, agentId, companyId);
          if (processedQA) {
            processedQAs.push(processedQA);
          }
        } catch (error) {
          console.error(`❌ Error processing Q&A pair:`, error);
          // Continue processing other Q&A pairs
        }
      }

      const processingTime = Date.now() - startTime;

      console.log(`✅ Q&A processing completed: ${processedQAs.length} pairs processed in ${processingTime}ms`);

      return {
        success: true,
        totalChunks: processedQAs.length,
        totalVectors: processedQAs.length, // Each Q&A pair becomes one vector
        processingTime,
        qaPairs: processedQAs
      };

    } catch (error) {
      console.error('❌ Q&A processing failed:', error);
      return {
        success: false,
        error: error.message,
        totalChunks: 0,
        totalVectors: 0,
        processingTime: 0,
        qaPairs: []
      };
    }
  }

  /**
   * Process a single Q&A pair
   * @param {Object} qaPair - Q&A object with question and answer
   * @param {string} agentId - Agent ID
   * @param {string} companyId - Company ID
   * @returns {Object} Processed Q&A with content and metadata
   */
  async processSingleQA(qaPair, agentId, companyId) {
    try {
      const { question, answer, title, id } = qaPair;

      if (!question || !answer) {
        console.warn('⚠️ Q&A pair missing question or answer:', qaPair);
        return null;
      }

      // Clean and format the Q&A content
      const cleanQuestion = this.cleanText(question);
      const cleanAnswer = this.cleanText(answer);

      // Create combined content for better semantic search
      const combinedContent = this.createCombinedContent(cleanQuestion, cleanAnswer);

      // Create metadata for the Q&A pair
      const metadata = {
        type: 'qa',
        source: 'manual',
        qaId: id || `qa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title: title || cleanQuestion.substring(0, 100),
        question: cleanQuestion,
        answer: cleanAnswer,
        wordCount: this.getWordCount(combinedContent),
        processedAt: new Date().toISOString()
      };

      return {
        content: combinedContent,
        metadata,
        agentId,
        companyId
      };

    } catch (error) {
      console.error('❌ Error processing single Q&A:', error);
      return null;
    }
  }

  /**
   * Create combined content from question and answer for better search
   * @param {string} question - Cleaned question
   * @param {string} answer - Cleaned answer
   * @returns {string} Combined content
   */
  createCombinedContent(question, answer) {
    // Format as a structured Q&A for better semantic understanding
    return `Question: ${question}\n\nAnswer: ${answer}`;
  }

  /**
   * Clean text content
   * @param {string} text - Raw text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .replace(/\r\n/g, '\n')           // Normalize line endings
      .replace(/\r/g, '\n')             // Handle old Mac line endings
      .replace(/\n{3,}/g, '\n\n')       // Reduce multiple line breaks
      .replace(/[ \t]+/g, ' ')          // Normalize whitespace
      .trim();                          // Remove leading/trailing whitespace
  }

  /**
   * Get word count for content
   * @param {string} content - Text content
   * @returns {number} Word count
   */
  getWordCount(content) {
    if (!content) return 0;
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Validate Q&A pair structure
   * @param {Object} qaPair - Q&A object to validate
   * @returns {Object} Validation result
   */
  validateQAPair(qaPair) {
    const errors = [];

    if (!qaPair) {
      errors.push('Q&A pair is required');
      return { isValid: false, errors };
    }

    if (!qaPair.question || typeof qaPair.question !== 'string' || qaPair.question.trim().length === 0) {
      errors.push('Question is required and must be a non-empty string');
    }

    if (!qaPair.answer || typeof qaPair.answer !== 'string' || qaPair.answer.trim().length === 0) {
      errors.push('Answer is required and must be a non-empty string');
    }

    if (qaPair.question && qaPair.question.length > 1000) {
      errors.push('Question is too long (max 1000 characters)');
    }

    if (qaPair.answer && qaPair.answer.length > 5000) {
      errors.push('Answer is too long (max 5000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new QAProcessingService();
