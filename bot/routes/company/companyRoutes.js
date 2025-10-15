import express from "express";
import companyController from "../../controller/company/companyController.js";
import {
  authenticateApiKey,
  authenticateSession,
} from "../../middleware/auth.js";

const router = express.Router();

// Company management routes
router.post("/create", companyController.createCompany.bind(companyController));

router.get(
  "/validate",
  authenticateApiKey,
  companyController.validateCompany.bind(companyController)
);

router.get(
  "/users",
  authenticateApiKey,
  companyController.getCompanyUsers.bind(companyController)
);

router.post(
  "/users",
  authenticateApiKey,
  companyController.addUserToCompany.bind(companyController)
);

// Additional company CRUD routes
router.get("/:companyId", companyController.getCompany.bind(companyController));

router.put(
  "/:companyId",
  authenticateApiKey,
  companyController.updateCompany.bind(companyController)
);

router.delete(
  "/:companyId",
  authenticateApiKey,
  companyController.deleteCompany.bind(companyController)
);

export default router;
