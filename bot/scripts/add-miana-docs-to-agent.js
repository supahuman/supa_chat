import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Agent from "../models/agentModel.js";
import NLPPipeline from "../services/nlp/NLPPipeline.js";
// Load environment variables from .env (bot/.env first, then project root)
try {
  const dotenv = await import("dotenv");
  // If script is run from project root, load bot/.env
  dotenv.config({ path: path.resolve(process.cwd(), "bot/.env") });
  // Also try current working directory .env
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
} catch {}

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const targetAgentId = process.env.AGENT_ID || "";

    if (!mongoUri) {
      console.error("❌ MONGODB_URI is not set");
      process.exit(1);
    }
    if (!targetAgentId) {
      console.error("❌ Provide AGENT_ID env var, e.g. AGENT_ID=agent_xxx");
      process.exit(1);
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log("✅ Connected to MongoDB");

    // Find agent and derive companyId
    const agent = await Agent.findOne({ agentId: targetAgentId });
    if (!agent) {
      console.error("❌ Agent not found:", targetAgentId);
      process.exit(1);
    }
    const companyId = agent.companyId;
    console.log("✅ Found agent:", agent.name, "companyId:", companyId);

    // Load Miana documentation markdown (resolve relative to this script)
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const docsPath = path.resolve(
      scriptDir,
      "../knowledge-base/miana-ai-documentation.md"
    );
    if (!fs.existsSync(docsPath)) {
      console.error("❌ Documentation file not found at", docsPath);
      process.exit(1);
    }
    const docsContent = fs.readFileSync(docsPath, "utf-8");

    // Append as a text knowledge item
    const knowledgeItemId = Date.now().toString();
    const knowledgeItem = {
      id: knowledgeItemId,
      title: "Miana AI Documentation",
      type: "text",
      content: docsContent,
      status: "saved",
      createdAt: new Date(),
    };

    agent.knowledgeBase.push(knowledgeItem);
    await agent.save();
    console.log("✅ Added documentation to agent knowledge base");

    // Process via NLP pipeline to create vectors
    console.log("🔄 Processing documentation through NLP pipeline...");
    const pipeline = new NLPPipeline();
    const result = await pipeline.processCrawledContent(
      targetAgentId,
      companyId,
      [
        {
          content: docsContent,
          title: "Miana AI Documentation",
          url: "text://miana-ai-documentation",
          category: "documentation",
          metadata: {
            source: "text-input",
            type: "text",
            title: "Miana AI Documentation",
            id: knowledgeItemId,
          },
        },
      ]
    );

    console.log("✅ NLP completed:", {
      totalChunks: result?.totalChunks,
      totalVectors: result?.totalVectors,
      processingTime: result?.processingTime,
    });
  } catch (err) {
    console.error("❌ Error adding documentation to agent:", err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {}
  }
}

main();
