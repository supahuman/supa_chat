import express from "express";
import ClientController from "../../controller/client/clientController.js";
import { processClientChatMessage } from "../../services/conversation/ConversationService.js";

const router = express.Router();
const clientController = new ClientController();

/**
 * Get client configuration
 * GET /api/client/:clientId/config
 */
router.get("/:clientId/config", (req, res) =>
  clientController.getClientConfig(req, res)
);

/**
 * Update client configuration
 * PUT /api/client/:clientId/config
 */
router.put("/:clientId/config", (req, res) =>
  clientController.updateClientConfig(req, res)
);

/**
 * Test client database connection
 * POST /api/client/:clientId/test-connection
 */
router.post("/:clientId/test-connection", (req, res) =>
  clientController.testConnection(req, res)
);

/**
 * List all clients
 * GET /api/client/list
 */
router.get("/list", (req, res) => clientController.listClients(req, res));

/**
 * Process bot message for specific client
 * POST /api/client/:clientId/bot
 */
router.post("/:clientId/bot", processClientChatMessage);

export default router;
