import crypto from 'crypto';
import Company from '../models/company.js';
import User from '../models/user.js';

class CompanyService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Create a new company
   */
  async createCompany(companyData) {
    try {
      const { name, domain, adminUser } = companyData;
      
      // Generate unique IDs
      const companyId = `company_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const apiKey = `sk_${crypto.randomBytes(16).toString('hex')}`;
      
      // Create company
      const company = new Company({
        companyId,
        name,
        domain,
        apiKey,
        settings: {
          maxAgents: 10,
          features: ['chat', 'knowledge-base', 'actions', 'forms']
        }
      });
      
      await company.save();
      
      // Create admin user
      const adminUserId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const user = new User({
        userId: adminUserId,
        email: adminUser.email,
        name: adminUser.name,
        companyId,
        role: 'admin'
      });
      
      await user.save();
      
      console.log(`✅ Created company: ${name} (${companyId})`);
      console.log(`✅ Created admin user: ${adminUser.email} (${adminUserId})`);
      
      return {
        success: true,
        data: {
          company: {
            companyId,
            name,
            domain,
            apiKey
          },
          adminUser: {
            userId: adminUserId,
            email: adminUser.email,
            name: adminUser.name,
            role: 'admin'
          }
        }
      };
    } catch (error) {
      console.error('❌ Error creating company:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get company by API key
   */
  async getCompanyByApiKey(apiKey) {
    try {
      // Handle mock credentials for development
      if (apiKey === 'sk_mock_1234567890abcdef') {
        return {
          companyId: 'company_mock_12345',
          name: 'Demo Company',
          domain: 'demo.com',
          apiKey: 'sk_mock_1234567890abcdef',
          settings: {
            maxAgents: 10,
            features: ['chat', 'knowledge-base', 'actions', 'forms']
          },
          isActive: true
        };
      }
      
      const company = await Company.findOne({ apiKey, isActive: true });
      return company;
    } catch (error) {
      console.error('❌ Error getting company by API key:', error);
      return null;
    }
  }

  /**
   * Get company by ID
   */
  async getCompanyById(companyId) {
    try {
      const company = await Company.findOne({ companyId, isActive: true });
      return company;
    } catch (error) {
      console.error('❌ Error getting company by ID:', error);
      return null;
    }
  }

  /**
   * Get users for a company
   */
  async getCompanyUsers(companyId) {
    try {
      const users = await User.find({ companyId, isActive: true });
      return users;
    } catch (error) {
      console.error('❌ Error getting company users:', error);
      return [];
    }
  }

  /**
   * Add user to company
   */
  async addUserToCompany(companyId, userData) {
    try {
      const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      
      const user = new User({
        userId,
        email: userData.email,
        name: userData.name,
        companyId,
        role: userData.role || 'user'
      });
      
      await user.save();
      
      console.log(`✅ Added user to company: ${userData.email} (${userId})`);
      
      return {
        success: true,
        data: {
          userId,
          email: userData.email,
          name: userData.name,
          companyId,
          role: userData.role || 'user'
        }
      };
    } catch (error) {
      console.error('❌ Error adding user to company:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate API key and get company info
   */
  async validateApiKey(apiKey) {
    try {
      const company = await this.getCompanyByApiKey(apiKey);
      if (!company) {
        return {
          success: false,
          error: 'Invalid API key'
        };
      }
      
      return {
        success: true,
        data: {
          companyId: company.companyId,
          name: company.name,
          domain: company.domain,
          settings: company.settings
        }
      };
    } catch (error) {
      console.error('❌ Error validating API key:', error);
      return {
        success: false,
        error: 'API key validation failed'
      };
    }
  }
}

export default new CompanyService();
