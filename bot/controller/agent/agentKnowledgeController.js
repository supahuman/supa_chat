import Agent from '../../models/agentModel.js';
import AgentVector from '../../models/agentVectorModel.js';
import AgentCrawlerService from '../../services/nlp/AgentCrawlerService.js';
import NLPPipeline from '../../services/nlp/NLPPipeline.js';
import DocumentProcessingService from '../../services/DocumentProcessingService.js';
import BaseController from '../shared/baseController.js';

/**
 * AgentKnowledgeController - Handles knowledge base operations
 * Responsible for adding, processing, and managing agent knowledge
 */
class AgentKnowledgeController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Add knowledge item to an agent
   */
  async addKnowledgeItem(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      const { agentId } = req.params;
      const { type, title, content, url, fileName, fileSize, question, answer } = req.body;
      
      // Validate required fields
      const validation = this.validateRequiredFields(req.body, ['type']);
      if (!validation.isValid) {
        return this.sendValidationError(res, 'Type is required', {
          missingFields: validation.missingFields
        });
      }

      if (!agentId) {
        return this.sendValidationError(res, 'Agent ID is required');
      }
      
      // Find the agent
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return this.sendNotFound(res, 'Agent');
      }
      
      // Create knowledge base item
      const knowledgeItem = {
        id: Date.now().toString(),
        title: title || 'Untitled',
        type,
        content,
        url,
        fileName,
        fileSize,
        question,
        answer,
        status: 'saved',
        createdAt: new Date()
      };
      
      // Add to agent's knowledge base
      agent.knowledgeBase.push(knowledgeItem);
      await agent.save();
      
      this.logAction('Added knowledge item', { agentId, type, companyId });
      
      // If it's a URL, trigger NLP processing
      if (type === 'url' && url) {
        try {
          this.logAction('Triggering NLP processing for URL', { url, agentId });
          await this.processKnowledgeBase(agentId, companyId, [url]);
        } catch (error) {
          this.logError('URL processing', error, { url, agentId });
          // Don't fail the request if NLP processing fails
        }
      }
      
      const message = type === 'url' ? 'URL added and processing started' : 'Knowledge item added successfully';
      return this.sendSuccess(res, knowledgeItem, message);
      
    } catch (error) {
      this.logError('Add knowledge item', error, { agentId: req.params.agentId });
      return this.sendError(res, 'Failed to add knowledge item');
    }
  }

  /**
   * Upload and process knowledge file
   */
  async uploadKnowledgeFile(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      const { agentId } = req.params;
      const { title } = req.body;
      const file = req.file;

      if (!agentId || !file) {
        return this.sendValidationError(res, 'Agent ID and file are required');
      }

      // Find the agent
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return this.sendNotFound(res, 'Agent');
      }

      this.logAction('Processing file upload', { agentId, fileName: file.originalname, companyId });

      // Initialize document processing service
      const docProcessor = new DocumentProcessingService();

      // Process the uploaded file
      const processingResult = await docProcessor.processFile(file);

      if (!processingResult.success) {
        // Clean up the file
        docProcessor.cleanupFile(file.path);
        return this.sendError(res, `File processing failed: ${processingResult.error}`, 400);
      }

      // Create knowledge base item
      const knowledgeItem = {
        id: Date.now().toString(),
        title: title || file.originalname,
        type: 'file',
        fileName: file.originalname,
        fileSize: file.size,
        status: 'processing',
        createdAt: new Date(),
        metadata: {
          ...processingResult.metadata,
          originalName: file.originalname,
          uploadedAt: new Date()
        }
      };

      // Add to agent's knowledge base
      agent.knowledgeBase.push(knowledgeItem);
      await agent.save();

      this.logAction('Added file knowledge item', { agentId, fileName: file.originalname });

      // Process the extracted text through NLP pipeline
      try {
        this.logAction('Processing extracted text through NLP pipeline', { agentId });
        
        // Create content object similar to crawled content
        const fileContent = {
          content: processingResult.text,
          title: title || file.originalname,
          url: `file://${file.originalname}`,
          category: 'uploaded-file',
          metadata: {
            ...processingResult.metadata,
            source: 'file-upload',
            originalName: file.originalname
          }
        };

        // Process through NLP pipeline
        const nlpPipeline = new NLPPipeline();
        const nlpResult = await nlpPipeline.processCrawledContent(
          agentId,
          companyId,
          [fileContent]
        );

        // Update knowledge item status
        knowledgeItem.status = 'completed';
        knowledgeItem.metadata.nlpProcessing = {
          success: true,
          chunks: nlpResult.totalChunks,
          vectors: nlpResult.totalVectors,
          processingTime: nlpResult.processingTime
        };

        await agent.save();

        this.logAction('NLP processing completed', { 
          agentId, 
          fileName: file.originalname,
          chunks: nlpResult.totalChunks,
          vectors: nlpResult.totalVectors
        });

      } catch (nlpError) {
        this.logError('NLP processing', nlpError, { agentId, fileName: file.originalname });
        
        // Update knowledge item status to failed
        knowledgeItem.status = 'failed';
        knowledgeItem.metadata.nlpProcessing = {
          success: false,
          error: nlpError.message
        };
        await agent.save();
      }

      // Clean up the temporary file
      docProcessor.cleanupFile(file.path);

      return this.sendSuccess(res, knowledgeItem, 'File uploaded and processed successfully');

    } catch (error) {
      this.logError('Upload knowledge file', error, { agentId: req.params.agentId });
      
      // Clean up file if it exists
      if (req.file && req.file.path) {
        const docProcessor = new DocumentProcessingService();
        docProcessor.cleanupFile(req.file.path);
      }

      return this.sendError(res, 'Failed to upload and process file');
    }
  }

  /**
   * Delete knowledge item from an agent
   */
  async deleteKnowledgeItem(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      const { agentId, knowledgeId } = req.params;
      
      if (!agentId || !knowledgeId) {
        return this.sendValidationError(res, 'Agent ID and Knowledge ID are required');
      }
      
      // Find the agent
      const agent = await Agent.findOne({ agentId, companyId });
      if (!agent) {
        return this.sendNotFound(res, 'Agent');
      }
      
      // Find the knowledge item to get its details for vector cleanup
      const knowledgeItem = agent.knowledgeBase.find(item => item.id === knowledgeId);
      if (!knowledgeItem) {
        return this.sendNotFound(res, 'Knowledge item');
      }
      
      // Remove the knowledge item from agent's knowledge base
      agent.knowledgeBase = agent.knowledgeBase.filter(item => item.id !== knowledgeId);
      await agent.save();
      
      // Clean up associated vectors from the vector database
      try {
        let vectorQuery = { agentId, companyId };
        
        // Build query based on knowledge item type
        if (knowledgeItem.type === 'url') {
          vectorQuery['source.url'] = knowledgeItem.url;
        } else if (knowledgeItem.type === 'file') {
          vectorQuery['source.name'] = knowledgeItem.fileName;
        } else if (knowledgeItem.type === 'text') {
          // For text items, we'll match by content similarity
          vectorQuery['source.type'] = 'text';
          vectorQuery['source.name'] = knowledgeItem.title;
        } else if (knowledgeItem.type === 'qa') {
          vectorQuery['source.type'] = 'qa';
          vectorQuery['source.name'] = knowledgeItem.title;
        }
        
        const deletedVectors = await AgentVector.deleteMany(vectorQuery);
        
        this.logAction('Cleaned up vectors', { 
          agentId, 
          knowledgeId, 
          deletedCount: deletedVectors.deletedCount,
          vectorQuery 
        });
        
      } catch (vectorError) {
        this.logError('Vector cleanup', vectorError, { agentId, knowledgeId });
        // Don't fail the request if vector cleanup fails
      }
      
      this.logAction('Deleted knowledge item', { agentId, knowledgeId, companyId });
      
      return this.sendSuccess(res, null, 'Knowledge item and associated vectors deleted successfully');
      
    } catch (error) {
      this.logError('Delete knowledge item', error, { 
        agentId: req.params.agentId, 
        knowledgeId: req.params.knowledgeId 
      });
      return this.sendError(res, 'Failed to delete knowledge item');
    }
  }

  /**
   * Process knowledge base through NLP pipeline
   * @private
   */
  async processKnowledgeBase(agentId, companyId, urls) {
    try {
      if (!urls || urls.length === 0) {
        this.logAction('No URLs to process', { agentId });
        return;
      }

      this.logAction('Starting NLP processing', { agentId, urlCount: urls.length });
      
      // Use AgentCrawlerService to crawl URLs
      const crawler = AgentCrawlerService; // Use the singleton instance
      const crawledContent = [];
      
      for (const url of urls) {
        try {
          this.logAction('Crawling URL', { url, agentId });
          const result = await crawler.crawlWithLangChain(url);
          if (result) {
            crawledContent.push(result);
            this.logAction('Successfully crawled URL', { url, contentLength: result.content?.length || 0 });
          } else {
            this.logAction('Failed to crawl URL', { url });
          }
        } catch (error) {
          this.logError('Crawl URL', error, { url, agentId });
        }
      }
      
      if (crawledContent.length === 0) {
        this.logAction('No content crawled, skipping NLP processing', { agentId });
        return;
      }
      
      // Process through NLP pipeline
      const nlpPipeline = new NLPPipeline();
      
      const result = await nlpPipeline.processCrawledContent(
        agentId,
        companyId,
        crawledContent
      );

      this.logAction('NLP processing completed', {
        agentId,
        totalChunks: result.totalChunks,
        totalVectors: result.totalVectors,
        processingTime: result.processingTime
      });

      return result;

    } catch (error) {
      this.logError('Process knowledge base', error, { agentId, companyId });
      throw error;
    }
  }
}

export default new AgentKnowledgeController();
