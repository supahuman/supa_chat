import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import Agent from "../models/agentModel.js";

async function checkKnowledgeBases() {
  try {
    console.log("🔍 Checking knowledgebases collection...");

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

    // Check knowledgebases collection
    const knowledgeBases = await mongoose.connection.db
      .collection("knowledgebases")
      .find({})
      .toArray();
    console.log(
      `📚 Total documents in 'knowledgebases' collection: ${knowledgeBases.length}`
    );

    if (knowledgeBases.length > 0) {
      knowledgeBases.forEach((doc, index) => {
        console.log(`${index + 1}. Title: ${doc.title || "No title"}`);
        console.log(`   AgentId: ${doc.agentId}`);
        console.log(`   Type: ${doc.type || "No type"}`);
        console.log(
          `   Content preview: ${
            doc.content ? doc.content.substring(0, 100) + "..." : "No content"
          }`
        );
        console.log("---");
      });
    }

    // Check for documents with our agent ID
    const agentKnowledge = await mongoose.connection.db
      .collection("knowledgebases")
      .find({ agentId: agent._id })
      .toArray();
    console.log(
      `\n🎯 Knowledge entries for this agent: ${agentKnowledge.length}`
    );
  } catch (error) {
    console.error("❌ Failed to check knowledgebases:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
checkKnowledgeBases();
