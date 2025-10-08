import CompanyService from '../services/CompanyService.js';
import Agent from '../models/agentModel.js';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * Middleware to authenticate requests using API key
 */
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-company-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const userId = req.headers['x-user-id'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required. Provide X-Company-Key header.'
      });
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID required. Provide X-User-ID header.'
      });
    }
    
    // Validate API key and get company info
    const validation = await CompanyService.validateApiKey(apiKey);
    if (!validation.success) {
      return res.status(401).json({
        success: false,
        error: validation.error
      });
    }
    
    // Add company and user info to request
    req.company = validation.data;
    req.userId = userId;
    req.companyId = validation.data.companyId;
    
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Middleware for session-based auth (web interface)
 */
export const authenticateSession = async (req, res, next) => {
  try {
    // For web interface, we'll use session data
    // This can be extended to use JWT tokens or session storage
    const { userId, companyId } = req.session || {};
    
    if (!userId || !companyId) {
      return res.status(401).json({
        success: false,
        error: 'Session required. Please log in.'
      });
    }
    
    // Validate company exists
    const company = await CompanyService.getCompanyById(companyId);
    if (!company) {
      return res.status(401).json({
        success: false,
        error: 'Invalid company session'
      });
    }
    
    req.userId = userId;
    req.companyId = companyId;
    req.company = company;
    
    next();
  } catch (error) {
    console.error('❌ Session authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Session authentication failed'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no auth provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-company-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const userId = req.headers['x-user-id'];
    
    if (apiKey && userId) {
      const validation = await CompanyService.validateApiKey(apiKey);
      if (validation.success) {
        req.company = validation.data;
        req.userId = userId;
        req.companyId = validation.data.companyId;
      }
    }
    
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};

/**
 * Legacy protect middleware for existing routes
 * This is a simple pass-through for now
 */
export const protect = async (req, res, next) => {
  // For now, just pass through - existing routes will work
  // In production, you'd implement proper authentication here
  next();
};

/**
 * Company authentication middleware
 * Validates company API key and sets company context
 */
export const authenticateCompany = async (req, res, next) => {
  try {
    const companyKey = req.headers['x-company-key'];
    const userId = req.headers['x-user-id'];

    if (!companyKey) {
      return res.status(401).json({
        success: false,
        error: 'Company API key required'
      });
    }

    // For now, accept any company key (in production, validate against database)
    req.company = {
      companyId: companyKey,
      userId: userId || 'anonymous'
    };

    next();
  } catch (error) {
    console.error('❌ Company authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Middleware to authenticate requests using agent API key
 * This is the new authentication method for agent-specific operations
 */
export const authenticateAgentApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-company-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const userId = req.headers['x-user-id'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Agent API key required. Provide X-Company-Key header.'
      });
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID required. Provide X-User-ID header.'
      });
    }
    
    // Validate agent API key and get agent info
    const agent = await Agent.findOne({ apiKey, status: 'active' });
    if (!agent) {
      return res.status(401).json({
        success: false,
        error: 'Invalid agent API key'
      });
    }
    
    // Add agent and company info to request
    req.agent = agent;
    req.agentId = agent.agentId;
    req.companyId = agent.companyId;
    req.userId = userId;
    
    next();
  } catch (error) {
    console.error('❌ Agent authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Agent authentication failed'
    });
  }
};

/**
 * JWT Authentication middleware
 * Validates JWT token and sets user context
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        error: 'JWT_SECRET environment variable is not configured'
      });
    }
    const decoded = jwt.verify(token, jwtSecret);
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found'
      });
    }

    req.user = user;
    req.userId = user._id;
    req.userEmail = user.email;
    
    next();
  } catch (error) {
    console.error('❌ JWT authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

/**
 * Optional JWT authentication - doesn't fail if no token provided
 */
export const optionalJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        error: 'JWT_SECRET environment variable is not configured'
      });
    }
      const decoded = jwt.verify(token, jwtSecret);
      
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.userEmail = user.email;
      }
    }
    
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};

/**
 * Legacy admin middleware for existing routes
 */
export const isAdmin = async (req, res, next) => {
  // For now, just pass through - existing routes will work
  // In production, you'd check if user has admin role
  next();
};