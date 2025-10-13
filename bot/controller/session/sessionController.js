import Session from '../../models/sessionModel.js';
import User from '../../models/userModel.js';
import BaseController from '../shared/baseController.js';
import { v4 as uuidv4 } from 'uuid';

class SessionController extends BaseController {

  // Create new session
  async createSession(req, res) {
    try {
      const { userId, deviceInfo, ipAddress, location, isPaymentSession = false, expiresInHours = 168 } = req.body; // 168 hours = 7 days

      // Validate required fields
      if (!userId || !ipAddress) {
        return res.status(400).json({
          success: false,
          error: 'userId and ipAddress are required'
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Generate unique session ID and token ID
      const sessionId = `sess_${uuidv4()}`;
      const tokenId = `token_${uuidv4()}`;

      // Calculate expiration time
      const expiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));

      // Create session
      const session = new Session({
        userId,
        sessionId,
        tokenId,
        deviceInfo: deviceInfo || {},
        ipAddress,
        location: location || {},
        isPaymentSession,
        expiresAt
      });

      await session.save();

      console.log('[SessionController] ✅ Session created', { 
        sessionId, 
        userId, 
        isPaymentSession,
        expiresAt 
      });

      res.json({
        success: true,
        session: {
          sessionId,
          tokenId,
          expiresAt,
          isPaymentSession
        },
        message: 'Session created successfully'
      });

    } catch (error) {
      console.error('[SessionController] ❌ Create session failed:', {
        error: error.message,
        stack: error.stack,
        body: req.body
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get active sessions for user
  async getUserSessions(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }

      const sessions = await Session.getActiveSessions(userId);

      console.log('[SessionController] ✅ Retrieved user sessions', { 
        userId, 
        sessionCount: sessions.length 
      });

      res.json({
        success: true,
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          location: session.location,
          isPaymentSession: session.isPaymentSession,
          lastActivity: session.lastActivity,
          loginTime: session.loginTime,
          expiresAt: session.expiresAt
        })),
        message: 'Sessions retrieved successfully'
      });

    } catch (error) {
      console.error('[SessionController] ❌ Get user sessions failed:', {
        error: error.message,
        stack: error.stack,
        params: req.params
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Update session activity
  async updateSessionActivity(req, res) {
    try {
      const { sessionId } = req.params;
      const { ipAddress } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId is required'
        });
      }

      const session = await Session.findOne({ 
        sessionId, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found or expired'
        });
      }

      // Update last activity
      session.lastActivity = new Date();
      
      // Check for suspicious activity (IP change)
      if (ipAddress && session.ipAddress !== ipAddress) {
        session.isSuspicious = true;
        console.log('[SessionController] ⚠️ Suspicious activity detected', {
          sessionId,
          oldIp: session.ipAddress,
          newIp: ipAddress
        });
      }

      await session.save();

      res.json({
        success: true,
        message: 'Session activity updated'
      });

    } catch (error) {
      console.error('[SessionController] ❌ Update session activity failed:', {
        error: error.message,
        stack: error.stack,
        params: req.params
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Deactivate session (logout)
  async deactivateSession(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId is required'
        });
      }

      const session = await Session.findOne({ sessionId, isActive: true });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      await session.deactivate();

      console.log('[SessionController] ✅ Session deactivated', { sessionId });

      res.json({
        success: true,
        message: 'Session deactivated successfully'
      });

    } catch (error) {
      console.error('[SessionController] ❌ Deactivate session failed:', {
        error: error.message,
        stack: error.stack,
        params: req.params
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Deactivate all sessions for user
  async deactivateAllUserSessions(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }

      const result = await Session.updateMany(
        { userId, isActive: true },
        { 
          isActive: false,
          logoutTime: new Date()
        }
      );

      console.log('[SessionController] ✅ All user sessions deactivated', { 
        userId, 
        deactivatedCount: result.modifiedCount 
      });

      res.json({
        success: true,
        deactivatedCount: result.modifiedCount,
        message: 'All user sessions deactivated successfully'
      });

    } catch (error) {
      console.error('[SessionController] ❌ Deactivate all user sessions failed:', {
        error: error.message,
        stack: error.stack,
        params: req.params
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Clean expired sessions
  async cleanExpiredSessions(req, res) {
    try {
      const result = await Session.cleanExpiredSessions();

      console.log('[SessionController] ✅ Expired sessions cleaned', { 
        cleanedCount: result.modifiedCount 
      });

      res.json({
        success: true,
        cleanedCount: result.modifiedCount,
        message: 'Expired sessions cleaned successfully'
      });

    } catch (error) {
      console.error('[SessionController] ❌ Clean expired sessions failed:', {
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get session by ID
  async getSession(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'sessionId is required'
        });
      }

      const session = await Session.findOne({ sessionId }).populate('userId', 'email firstName lastName');

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      res.json({
        success: true,
        session: {
          sessionId: session.sessionId,
          userId: session.userId,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          location: session.location,
          isPaymentSession: session.isPaymentSession,
          isSuspicious: session.isSuspicious,
          lastActivity: session.lastActivity,
          loginTime: session.loginTime,
          expiresAt: session.expiresAt,
          isActive: session.isActive
        },
        message: 'Session retrieved successfully'
      });

    } catch (error) {
      console.error('[SessionController] ❌ Get session failed:', {
        error: error.message,
        stack: error.stack,
        params: req.params
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default new SessionController();
