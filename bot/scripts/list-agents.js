import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import Agent from "../models/agentModel.js";

async function listAgents() {
  try {
    console.log("🚀 Listing all agents...");

    // Connect to MongoDB (Production)
    const mongoUri =
      "mongodb+srv://successkoncepts:Engin33!classic@african-vibes-prod.l64busa.mongodb.net/miana?retryWrites=true&w=majority&appName=african-vibes-prod";

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find all agents
    const agents = await Agent.find({});

    if (agents.length === 0) {
      console.log("❌ No agents found in database");
      return;
    }

    console.log(`✅ Found ${agents.length} agent(s):`);
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. Agent ID: ${agent.agentId}`);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Company: ${agent.companyId}`);
      console.log(`   Created: ${agent.createdAt}`);
      console.log(`   Knowledge Count: ${agent.knowledgeCount || 0}`);
      console.log("---");
    });
  } catch (error) {
    console.error("❌ Failed to list agents:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
listAgents();
