import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: process.env.ENV_PATH || '.env' });

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://supa-chat-mu.vercel.app',
      'https://supa-chat-mu.vercel.app/',
      process.env.CORS_ORIGIN
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

import { initializeBot, registerBotRoutes } from './utils/botUtils.js';
import clientManagementRoutes from './routes/client/clientManagementRoutes.js';
import escalationRoutes from './routes/shared/escalationRoutes.js';
import modelRoutes from './routes/shared/modelRoutes.js';
import companyRoutes from './routes/company/companyRoutes.js';
import companyAgentRoutes from './routes/agent/companyAgentRoutes.js';
import agentCrawlerRoutes from './routes/agent/agentCrawlerRoutes.js';
import deploymentRoutes from './routes/deployment/deploymentRoutes.js';
import toolRoutes from './routes/tool/toolRoutes.js';
import agentChatRoutes from './routes/agent/agentChatRoutes.js';

async function bootstrap() {
  const port = process.env.PORT || 4000;
  const mongoUri = process.env.MONGODB_URI || '';

  if (!mongoUri) {
    console.warn('MONGODB_URI is not set. Set it in your .env file.');
  }

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
      console.log('✅ Connected to MongoDB');
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err.message);
    }
  }

  // Register client management routes
  app.use('/api/client', clientManagementRoutes);
  
  // Register escalation routes
  app.use('/api/escalation', escalationRoutes);
  
  // Register model routes
  app.use('/api/model', modelRoutes);
  
  
  // Register specific routes FIRST (more specific routes)
  app.use('/api/company/agents', deploymentRoutes);
  app.use('/api/company/agents', agentCrawlerRoutes);
  app.use('/api/company/agents', companyAgentRoutes);
  app.use('/api/company', toolRoutes);
  app.use('/api/company', agentChatRoutes);
  
  // Register company management routes LAST (catch-all routes)
  app.use('/api/company', companyRoutes);

  try {
    const botRoutes = await initializeBot();
    registerBotRoutes(app, botRoutes);
  } catch (err) {
    console.warn('Bot initialization failed:', err.message);
  }

  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

bootstrap();


