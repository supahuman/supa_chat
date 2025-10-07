import Company from '../../models/companyModel.js';
import User from '../../models/userModel.js';
import CompanyService from '../../services/CompanyService.js';
import BaseController from '../shared/baseController.js';

/**
 * CompanyController - Handles all company operations
 * Responsible for company CRUD, user management, and company settings
 */
class CompanyController extends BaseController {
  constructor() {
    super();
    this.companyService = CompanyService;
  }

  /**
   * Create a new company
   */
  async createCompany(req, res) {
    try {
      this.logAction('Creating company', { body: req.body });
      
      const result = await this.companyService.createCompany(req.body);
      
      if (result.success) {
        this.logAction('Company created successfully', { companyId: result.data?.companyId });
        return this.sendSuccess(res, result.data, 'Company created successfully', 201);
      } else {
        return this.sendError(res, result.error, 400);
      }
    } catch (error) {
      this.logError('Create company', error, { body: req.body });
      return this.sendError(res, 'Failed to create company');
    }
  }

  /**
   * Validate company and return company info
   */
  async validateCompany(req, res) {
    try {
      const { companyId, company } = this.getCompanyContext(req);
      
      this.logAction('Company validation', { companyId });
      
      const companyData = {
        companyId,
        name: company.name,
        domain: company.domain,
        settings: company.settings
      };
      
      return this.sendSuccess(res, companyData, 'Company validated successfully');
    } catch (error) {
      this.logError('Validate company', error, { companyId: req.companyId });
      return this.sendError(res, 'Failed to validate company');
    }
  }

  /**
   * Get all users for a company
   */
  async getCompanyUsers(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      
      this.logAction('Getting company users', { companyId });
      
      const users = await this.companyService.getCompanyUsers(companyId);
      
      return this.sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      this.logError('Get company users', error, { companyId: req.companyId });
      return this.sendError(res, 'Failed to get users');
    }
  }

  /**
   * Add user to company
   */
  async addUserToCompany(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      
      this.logAction('Adding user to company', { companyId, userData: req.body });
      
      const result = await this.companyService.addUserToCompany(companyId, req.body);
      
      if (result.success) {
        this.logAction('User added successfully', { companyId, userId: result.data?.userId });
        return this.sendSuccess(res, result.data, 'User added successfully', 201);
      } else {
        return this.sendError(res, result.error, 400);
      }
    } catch (error) {
      this.logError('Add user to company', error, { companyId: req.companyId });
      return this.sendError(res, 'Failed to add user');
    }
  }

  /**
   * Get company by ID
   */
  async getCompany(req, res) {
    try {
      const { companyId } = req.params;
      
      this.logAction('Getting company', { companyId });
      
      const company = await Company.findOne({ companyId });
      if (!company) {
        return this.sendNotFound(res, 'Company');
      }
      
      return this.sendSuccess(res, company, 'Company retrieved successfully');
    } catch (error) {
      this.logError('Get company', error, { companyId: req.params.companyId });
      return this.sendError(res, 'Failed to get company');
    }
  }

  /**
   * Update company settings
   */
  async updateCompany(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      const updateData = req.body;
      
      this.logAction('Updating company', { companyId, updateData });
      
      const company = await Company.findOne({ companyId });
      if (!company) {
        return this.sendNotFound(res, 'Company');
      }
      
      // Update company fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'companyId') {
          company[key] = updateData[key];
        }
      });
      
      company.updatedAt = new Date();
      await company.save();
      
      this.logAction('Company updated successfully', { companyId, updatedFields: Object.keys(updateData) });
      
      return this.sendSuccess(res, company, 'Company updated successfully');
    } catch (error) {
      this.logError('Update company', error, { companyId: req.companyId });
      return this.sendError(res, 'Failed to update company');
    }
  }

  /**
   * Delete company (soft delete)
   */
  async deleteCompany(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      
      this.logAction('Deleting company', { companyId });
      
      const company = await Company.findOne({ companyId });
      if (!company) {
        return this.sendNotFound(res, 'Company');
      }
      
      // Soft delete by updating status
      company.status = 'deleted';
      company.deletedAt = new Date();
      await company.save();
      
      this.logAction('Company deleted successfully', { companyId });
      
      return this.sendSuccess(res, null, 'Company deleted successfully');
    } catch (error) {
      this.logError('Delete company', error, { companyId: req.companyId });
      return this.sendError(res, 'Failed to delete company');
    }
  }
}

export default new CompanyController();
