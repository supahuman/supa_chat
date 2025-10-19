import AgentAction from "../../models/agentActionModel.js";

export async function listAgentActions(req, res) {
  try {
    const { agentId } = req.params;
    const actions = await AgentAction.find({ agentId }).sort({ createdAt: -1 });
    res.json({ success: true, data: actions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createAgentAction(req, res) {
  try {
    const { agentId } = req.params;
    const payload = { ...req.body, agentId };
    const created = await AgentAction.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function updateAgentAction(req, res) {
  try {
    const { agentId, actionId } = req.params;
    const updated = await AgentAction.findOneAndUpdate(
      { _id: actionId, agentId },
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function deleteAgentAction(req, res) {
  try {
    const { agentId, actionId } = req.params;
    const deleted = await AgentAction.findOneAndDelete({
      _id: actionId,
      agentId,
    });
    if (!deleted)
      return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
