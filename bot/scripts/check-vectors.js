import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import Agent from "../models/agentModel.js";
import AgentVector from "../models/agentVectorModel.js";

async function checkVectors() {
  try {
    console.log("🔍 Checking vector database...");

    // Connect to MongoDB (Production)
    const mongoUri =
      "mongodb+srv://successkoncepts:Engin33!classic@african-vibes-prod.l64busa.mongodb.net/miana?retryWrites=true&w=majority&appName=african-vibes-prod";

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Get the agent ID
    const agentId = "agent_1760555988812_ht1ma2dyf";

    // Find the agent
    const agent = await Agent.findOne({ agentId: agentId });
    if (!agent) {
      console.error(`❌ Agent with ID ${agentId} not found`);
      return;
    }

    console.log(`✅ Found agent: ${agent.name}`);
    console.log(`Agent ObjectId: ${agent._id}`);

    // Check vectors in AgentVector collection
    const vectors = await AgentVector.find({ agentId: agent.agentId });
    console.log(`📊 Total vectors for this agent: ${vectors.length}`);

    if (vectors.length > 0) {
      console.log("📚 Vector details:");
      vectors.forEach((vector, index) => {
        console.log(
          `${index + 1}. Content preview: ${vector.content.substring(
            0,
            100
          )}...`
        );
        console.log(`   Source: ${vector.source?.title || "No title"}`);
        console.log(`   Category: ${vector.source?.category || "No category"}`);
        console.log(
          `   Embedding dimension: ${
            vector.embedding?.length || "No embedding"
          }`
        );
        console.log("---");
      });
    } else {
      console.log("❌ No vectors found for this agent");
    }

    // Check all vectors in the collection
    const allVectors = await AgentVector.find({});
    console.log(`\n📊 Total vectors in database: ${allVectors.length}`);

    if (allVectors.length > 0) {
      console.log("📚 All vectors:");
      allVectors.forEach((vector, index) => {
        console.log(`${index + 1}. AgentId: ${vector.agentId}`);
        console.log(
          `   Content preview: ${vector.content.substring(0, 50)}...`
        );
        console.log(`   Source: ${vector.source?.title || "No title"}`);
        console.log("---");
      });
    }
  } catch (error) {
    console.error("❌ Failed to check vectors:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
checkVectors();
