import jwt from 'jsonwebtoken';
import Session from '../models/sessionModel.js';
import User from '../models/userModel.js';

/**
 * Session validation middleware
 * Validates JWT token and updates session activity
 */
export const validateSession = async (req, res, next) => {
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

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Check if session exists and is active
    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      tokenId: decoded.tokenId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    // Get user info
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Update session activity
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    
    // Check for suspicious activity (IP change)
    if (session.ipAddress !== ipAddress) {
      session.isSuspicious = true;
      console.log('[SessionMiddleware] ⚠️ Suspicious activity detected', {
        sessionId: session.sessionId,
        userId: user._id,
        oldIp: session.ipAddress,
        newIp: ipAddress
      });
    }

    session.lastActivity = new Date();
    await session.save();

    // Add session and user info to request
    req.user = user;
    req.session = session;
    req.userId = user._id;
    req.sessionId = session.sessionId;

    next();
  } catch (error) {
    console.error('[SessionMiddleware] ❌ Session validation failed:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

/**
 * Payment session validation middleware
 * More strict validation for payment-related operations
 */
export const validatePaymentSession = async (req, res, next) => {
  try {
    // First validate regular session
    await validateSession(req, res, () => {});

    if (!req.session) {
      return; // Error already sent by validateSession
    }

    // Additional checks for payment sessions
    if (req.session.isSuspicious) {
      return res.status(403).json({
        success: false,
        error: 'Suspicious activity detected. Please re-authenticate.'
      });
    }

    // Check if session is too old for payments (max 1 hour)
    const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
    if (req.session.lastActivity < oneHourAgo) {
      return res.status(403).json({
        success: false,
        error: 'Session too old for payment operations. Please re-authenticate.'
      });
    }

    next();
  } catch (error) {
    console.error('[SessionMiddleware] ❌ Payment session validation failed:', error);
    return res.status(401).json({
      success: false,
      error: 'Payment session validation failed'
    });
  }
};

/**
 * Optional session validation middleware
 * Doesn't fail if no session, but adds session info if available
 */
export const optionalSessionValidation = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // No token, continue without session
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(); // No secret, continue without session
    }

    // Try to verify token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Try to get session
    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      tokenId: decoded.tokenId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (session) {
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.session = session;
        req.userId = user._id;
        req.sessionId = session.sessionId;
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional validation
    next();
  }
};
