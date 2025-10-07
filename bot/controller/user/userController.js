import User from '../../models/userModel.js';
import BaseController from '../shared/baseController.js';

/**
 * UserController - Handles user management operations
 * Modular controller under 150 lines
 */
class UserController extends BaseController {
  constructor() {
    super();
    this.logAction('UserController initialized');
  }

  /**
   * Create a new user
   */
  async createUser(req, res) {
    try {
      const { userId, email, name, companyId, role } = req.body;
      
      const validation = this.validateRequiredFields(req.body, ['userId', 'email', 'name', 'companyId']);
      if (!validation.isValid) {
        return this.sendValidationError(res, 'Missing required fields', validation.missingFields);
      }

      const existingUser = await User.findOne({ 
        $or: [{ userId }, { email }] 
      });

      if (existingUser) {
        return this.sendError(res, 'User with this ID or email already exists', 409);
      }

      const user = new User({
        userId,
        email,
        name,
        companyId,
        role: role || 'user'
      });

      await user.save();
      this.logAction('User created', { userId, companyId });
      
      return this.sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      this.logError('createUser', error, { body: req.body });
      return this.sendError(res, 'Failed to create user', 500);
    }
  }

  /**
   * Get user by ID
   */
  async getUser(req, res) {
    try {
      const { userId } = req.params;
      const { companyId } = this.getCompanyContext(req);

      const user = await User.findOne({ userId, companyId });
      if (!user) {
        return this.sendNotFound(res, 'User');
      }

      return this.sendSuccess(res, user);
    } catch (error) {
      this.logError('getUser', error, { userId: req.params.userId });
      return this.sendError(res, 'Failed to get user', 500);
    }
  }

  /**
   * Get all users for a company
   */
  async getUsers(req, res) {
    try {
      const { companyId } = this.getCompanyContext(req);
      const { role, isActive } = req.query;

      const filter = { companyId };
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const users = await User.find(filter).sort({ createdAt: -1 });
      
      return this.sendSuccess(res, users);
    } catch (error) {
      this.logError('getUsers', error, { companyId: req.companyId });
      return this.sendError(res, 'Failed to get users', 500);
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { companyId } = this.getCompanyContext(req);
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.userId;
      delete updateData.companyId;
      delete updateData.createdAt;

      const user = await User.findOneAndUpdate(
        { userId, companyId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        return this.sendNotFound(res, 'User');
      }

      this.logAction('User updated', { userId, companyId });
      return this.sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      this.logError('updateUser', error, { userId: req.params.userId });
      return this.sendError(res, 'Failed to update user', 500);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const { companyId } = this.getCompanyContext(req);

      const user = await User.findOneAndDelete({ userId, companyId });
      if (!user) {
        return this.sendNotFound(res, 'User');
      }

      this.logAction('User deleted', { userId, companyId });
      return this.sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      this.logError('deleteUser', error, { userId: req.params.userId });
      return this.sendError(res, 'Failed to delete user', 500);
    }
  }

  /**
   * Update user's last login
   */
  async updateLastLogin(req, res) {
    try {
      const { userId } = req.params;
      const { companyId } = this.getCompanyContext(req);

      const user = await User.findOneAndUpdate(
        { userId, companyId },
        { lastLogin: new Date() },
        { new: true }
      );

      if (!user) {
        return this.sendNotFound(res, 'User');
      }

      return this.sendSuccess(res, user, 'Last login updated');
    } catch (error) {
      this.logError('updateLastLogin', error, { userId: req.params.userId });
      return this.sendError(res, 'Failed to update last login', 500);
    }
  }
}

export default new UserController();
