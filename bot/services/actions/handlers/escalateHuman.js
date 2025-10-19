import Escalation from "../../../models/escalationModel.js";

export default async function escalateHumanHandler(action, context = {}) {
  const { params = {} } = action;
  const { reason, priority = "normal" } = params;
  const { agentId, conversationId, userId } = context;

  const record = await Escalation.create({
    agentId,
    conversationId,
    userId,
    reason: reason || "Escalated by rule",
    status: "open",
    priority,
  });

  return { type: "escalation", escalationId: record._id };
}
