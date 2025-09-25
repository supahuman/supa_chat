import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: process.env.ENV_PATH || '.env' });

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

import { initializeBot, registerBotRoutes } from './utils/botUtils.js';

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


