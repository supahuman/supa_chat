import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: process.env.ENV_PATH || '.env' });

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://*.vercel.app', // Vercel deployments
    process.env.CORS_ORIGIN // Custom domain if set
  ].filter(Boolean),
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
import clientManagementRoutes from './routes/clientManagementRoutes.js';
import escalationRoutes from './routes/escalationRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import companyAgentRoutes from './routes/companyAgentRoutes.js';
import agentCrawlerRoutes from './routes/agentCrawlerRoutes.js';
import deploymentRoutes from './routes/deploymentRoutes.js';
import toolRoutes from './routes/toolRoutes.js';

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
  
  // Register agent routes
  app.use('/api/agent', agentRoutes);
  
  // Register company management routes
  app.use('/api/company', companyRoutes);
  
  // Register deployment routes FIRST (more specific routes)
  app.use('/api/company/agents', deploymentRoutes);
  
  // Register agent crawler routes
  app.use('/api/company/agents', agentCrawlerRoutes);
  
  // Register company-scoped agent routes LAST (catch-all routes)
  app.use('/api/company/agents', companyAgentRoutes);
  
  // Register tool routes
  app.use('/api/company', toolRoutes);

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


