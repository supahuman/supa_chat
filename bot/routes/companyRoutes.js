import express from 'express';
import CompanyService from '../services/CompanyService.js';
import { authenticateApiKey, authenticateSession } from '../middleware/auth.js';

const router = express.Router();

// Company management routes
router.post('/create', async (req, res) => {
  try {
    const result = await CompanyService.createCompany(req.body);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create company'
    });
  }
});

router.get('/validate', authenticateApiKey, async (req, res) => {
  res.json({
    success: true,
    data: {
      companyId: req.companyId,
      name: req.company.name,
      domain: req.company.domain,
      settings: req.company.settings
    }
  });
});

router.get('/users', authenticateApiKey, async (req, res) => {
  try {
    const users = await CompanyService.getCompanyUsers(req.companyId);
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

router.post('/users', authenticateApiKey, async (req, res) => {
  try {
    const result = await CompanyService.addUserToCompany(req.companyId, req.body);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add user'
    });
  }
});

export default router;
