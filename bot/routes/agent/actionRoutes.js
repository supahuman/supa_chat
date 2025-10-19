import express from "express";
import {
  listAgentActions,
  createAgentAction,
  updateAgentAction,
  deleteAgentAction,
} from "../../controller/agent/agentActionController.js";

const router = express.Router({ mergeParams: true });

// List actions for an agent
router.get("/:agentId/actions", listAgentActions);

// Create action for an agent
router.post("/:agentId/actions", createAgentAction);

// Update action
router.put("/:agentId/actions/:actionId", updateAgentAction);

// Delete action
router.delete("/:agentId/actions/:actionId", deleteAgentAction);

export default router;
