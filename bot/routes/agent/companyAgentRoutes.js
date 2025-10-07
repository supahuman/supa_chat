import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import agentManagementController from '../../controller/agent/agentController.js';
import agentKnowledgeController from '../../controller/agent/agentKnowledgeController.js';
import agentChatController from '../../controller/agent/agentChatController.js';
import { authenticateApiKey, authenticateSession } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateApiKey);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'text/csv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, MD, and CSV files are allowed.'), false);
    }
  }
});

// Agent CRUD operations
router.post('/', agentManagementController.createAgent.bind(agentManagementController));
router.get('/', agentManagementController.getAgents.bind(agentManagementController));
router.get('/:agentId', agentManagementController.getAgent.bind(agentManagementController));
router.put('/:agentId', agentManagementController.updateAgent.bind(agentManagementController));
router.delete('/:agentId', agentManagementController.deleteAgent.bind(agentManagementController));

// Knowledge base operations
router.post('/:agentId/knowledge', agentKnowledgeController.addKnowledgeItem.bind(agentKnowledgeController));
router.delete('/:agentId/knowledge/:knowledgeId', agentKnowledgeController.deleteKnowledgeItem.bind(agentKnowledgeController));

// File upload endpoint for knowledge base
router.post('/:agentId/knowledge/upload', upload.single('file'), agentKnowledgeController.uploadKnowledgeFile.bind(agentKnowledgeController));

// Chat operations
router.post('/:agentId/chat', agentChatController.chatWithAgent.bind(agentChatController));
router.get('/:agentId/conversation/:sessionId', agentChatController.getConversation.bind(agentChatController));

export default router;
