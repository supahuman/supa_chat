import mongoose from "mongoose";

const agentActionSchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true, index: true },
    when: {
      type: String,
      enum: [
        "user-mentions",
        "user-asks-about",
        "user-requests",
        "user-says",
        "user-expresses",
        "conversation-starts",
        "user-greets",
      ],
      required: true,
    },
    about: {
      type: String,
      enum: [
        "customizable-service",
        "pricing",
        "support",
        "features",
        "account",
        "billing",
        "refund",
        "demo",
        "documentation",
        "integration",
      ],
      required: true,
    },
    do: {
      type: String,
      enum: [
        "send-email",
        "fill-form",
        "always-talk-about",
        "ask-info",
        "redirect-page",
        "show-documentation",
        "schedule-call",
        "create-ticket",
        "provide-link",
        "escalate-human",
      ],
      required: true,
      index: true,
    },
    params: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    createdBy: { type: String },
    companyId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

agentActionSchema.index({ agentId: 1, status: 1, do: 1 });

export default mongoose.model("AgentAction", agentActionSchema);
