import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the current directory (bot/)
dotenv.config({ path: path.join(__dirname, ".env") });

// Debug: Check if key environment variables are loaded
console.log("🔍 Environment variables loaded:");
console.log("STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "https://supa-chat-mu.vercel.app",
      "https://supa-chat-mu.vercel.app/",
      "https://miana-ai.vercel.app",
      "https://miana-ai.vercel.app/",
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    // Check if origin matches any allowed origin (with or without trailing slash)
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      return (
        origin === allowedOrigin ||
        origin === allowedOrigin.replace(/\/$/, "") ||
        origin === allowedOrigin + "/"
      );
    });

    if (isAllowed) {
      console.log("✅ CORS allowed origin:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked origin:", origin);
      console.log("🔍 Allowed origins:", allowedOrigins);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Company-Key",
    "X-User-ID",
  ],
};

app.use(cors(corsOptions));

// Exclude webhook endpoint from JSON parsing (needs raw body for Stripe signature verification)
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    cors: "enabled",
  });
});

// CORS test endpoint
app.get("/cors-test", (_req, res) => {
  res.status(200).json({
    message: "CORS is working!",
    origin: _req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

import { initializeBot, registerBotRoutes } from "./utils/botUtils.js";
import clientManagementRoutes from "./routes/client/clientManagementRoutes.js";
import escalationRoutes from "./routes/shared/escalationRoutes.js";
import modelRoutes from "./routes/shared/modelRoutes.js";
import paymentRoutes from "./routes/payment/paymentRoutes.js";
import companyRoutes from "./routes/company/companyRoutes.js";
import companyAgentRoutes from "./routes/agent/companyAgentRoutes.js";
import agentCrawlerRoutes from "./routes/agent/agentCrawlerRoutes.js";
import deploymentRoutes from "./routes/deployment/deploymentRoutes.js";
import toolRoutes from "./routes/tool/toolRoutes.js";
import agentChatRoutes from "./routes/agent/agentChatRoutes.js";
import userRoutes from "./routes/user/userRoutes.js";
import conversationRoutes from "./routes/conversation/conversationRoutes.js";
import agentVectorRoutes from "./routes/agentVector/agentVectorRoutes.js";
import authRoutes from "./routes/auth/authRoutes.js";
import sessionRoutes from "./routes/session/sessionRoutes.js";
import sessionCleanupJob from "./jobs/sessionCleanupJob.js";

async function bootstrap() {
  const port = process.env.PORT || 4000;
  const mongoUri = process.env.MONGODB_URI || "";
  const jwtSecret = process.env.JWT_SECRET;

  // Security check - JWT_SECRET is required
  if (!jwtSecret) {
    console.error("❌ JWT_SECRET is not configured! Authentication will fail.");
    console.error("   Add JWT_SECRET to your .env file.");
    console.error(
      "   Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    );
    process.exit(1);
  }

  if (!mongoUri) {
    console.warn("⚠️ MONGODB_URI is not set. Set it in your .env file.");
  }

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
      console.log("✅ Connected to MongoDB");
    } catch (err) {
      console.error("❌ MongoDB connection failed:", err.message);
    }
  }

  // Register client management routes
  app.use("/api/client", clientManagementRoutes);

  // Register escalation routes
  app.use("/api/escalation", escalationRoutes);

  // Register model routes
  app.use("/api/model", modelRoutes);

  // Register authentication routes
  app.use("/api/auth", authRoutes);

  // Register session management routes
  app.use("/api/sessions", sessionRoutes);

  // Register user management routes
  app.use("/api/users", userRoutes);

  // Register conversation routes
  app.use("/api/conversations", conversationRoutes);

  // Register agent vector routes
  app.use("/api/vectors", agentVectorRoutes);

  // Register specific routes FIRST (more specific routes)
  app.use("/api/company/agents", deploymentRoutes);
  app.use("/api/company/agents", agentCrawlerRoutes);
  app.use("/api/company/agents", companyAgentRoutes);
  app.use("/api/company", toolRoutes);
  app.use("/api/company", agentChatRoutes);

  // Agent API routes for embed widget
  app.use("/api/agent", agentChatRoutes);

  // Register company management routes LAST (catch-all routes)
  app.use("/api/company", companyRoutes);

  // Register payment routes
  app.use("/api/payment", paymentRoutes);

  try {
    const botRoutes = await initializeBot();
    registerBotRoutes(app, botRoutes);
  } catch (err) {
    console.warn("Bot initialization failed:", err.message);
  }

  // Start session cleanup job
  sessionCleanupJob.start();

  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`🔐 JWT_SECRET configured: ${jwtSecret ? "✅ Yes" : "❌ No"}`);
    console.log(`🗄️ MongoDB connected: ${mongoUri ? "✅ Yes" : "❌ No"}`);
    console.log(`🔐 Session management enabled`);
  });
}

bootstrap();
