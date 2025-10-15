import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/userModel.js';
import Session from '../../models/sessionModel.js';
import BaseController from '../shared/baseController.js';
import { v4 as uuidv4 } from 'uuid';

class AuthController extends BaseController {

  // Helper function to create session
  static async createUserSession(userId, req, isPaymentSession = false) {
    try {
      const sessionId = `sess_${uuidv4()}`;
      const tokenId = `token_${uuidv4()}`;
      const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

      // Extract device info from request
      const userAgent = req.headers['user-agent'] || '';
      const deviceInfo = {
        userAgent,
        platform: AuthController.extractPlatform(userAgent),
        browser: AuthController.extractBrowser(userAgent),
        os: AuthController.extractOS(userAgent)
      };

      // Get IP address
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

      const session = new Session({
        userId,
        sessionId,
        tokenId,
        deviceInfo,
        ipAddress,
        isPaymentSession,
        expiresAt
      });

      await session.save();

      return { sessionId, tokenId };
    } catch (error) {
      console.error('[AuthController] ❌ Create session failed:', error);
      return null;
    }
  }

  // Helper functions to extract device info
  static extractPlatform(userAgent) {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  static extractBrowser(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  static extractOS(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Google OAuth signup
  async googleSignup(req, res) {
    try {
      console.log('[AuthController] 🔄 Google signup request received:', {
        body: req.body,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        origin: req.headers.origin
      });
      
      const { googleId, email, firstName, lastName, profilePicture, emailVerified } = req.body;

      // Validate required fields
      if (!googleId || !email || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { email: email.toLowerCase() },
          { googleId: googleId }
        ]
      });

      if (user) {
        // User exists, check for conflicts
        if (user.googleId && user.googleId !== googleId) {
          console.error('[AuthController] ❌ Google ID conflict:', {
            existingGoogleId: user.googleId,
            newGoogleId: googleId,
            email: email
          });
          return res.status(409).json({
            success: false,
            error: 'This email is already associated with a different Google account'
          });
        }
        
        if (user.email.toLowerCase() === email.toLowerCase() && user.googleId !== googleId) {
          console.error('[AuthController] ❌ Email conflict:', {
            existingEmail: user.email,
            newEmail: email,
            existingGoogleId: user.googleId,
            newGoogleId: googleId
          });
          return res.status(409).json({
            success: false,
            error: 'This email is already registered with a different account'
          });
        }

        // Update Google ID if missing
        if (!user.googleId) {
          user.googleId = googleId;
          user.profilePicture = profilePicture;
          await user.save();
        }
      } else {
        // Create new user
        try {
          user = new User({
            googleId,
            email: email.toLowerCase(),
            firstName,
            lastName,
            profilePicture,
            emailVerified,
            provider: 'google',
            isActive: true
          });
          await user.save();
        } catch (saveError) {
          console.error('[AuthController] ❌ User creation failed:', {
            error: saveError.message,
            code: saveError.code,
            email: email,
            googleId: googleId
          });
          
          if (saveError.code === 11000) {
            // Duplicate key error
            if (saveError.keyPattern?.email) {
              return res.status(409).json({
                success: false,
                error: 'This email is already registered'
              });
            }
            if (saveError.keyPattern?.googleId) {
              return res.status(409).json({
                success: false,
                error: 'This Google account is already registered'
              });
            }
          }
          
          throw saveError;
        }
      }

      // Create session
      const sessionData = await AuthController.createUserSession(user._id, req, false);
      if (!sessionData) {
        throw new Error('Failed to create session');
      }

      // Generate JWT token with session info
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not configured');
      }
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          provider: 'google',
          sessionId: sessionData.sessionId,
          tokenId: sessionData.tokenId
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      console.log('[AuthController] ✅ Google signup successful', { 
        userId: user._id, 
        email,
        sessionId: sessionData.sessionId
      });

      res.json({
        success: true,
        token,
        session: {
          sessionId: sessionData.sessionId,
          expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
        },
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          provider: user.provider
        },
        message: 'User authenticated successfully'
      });

    } catch (error) {
      console.error('[AuthController] ❌ Google signup failed:', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        timestamp: new Date().toISOString()
      });
      
      // Return more specific error in development
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        success: false,
        error: isDevelopment ? error.message : 'Internal server error',
        ...(isDevelopment && { details: error.stack })
      });
    }
  }

  // Regular email/password signup
  async signup(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        provider: 'email',
        isActive: true
      });

      await user.save();

      // Create session
      const sessionData = await AuthController.createUserSession(user._id, req, false);
      if (!sessionData) {
        throw new Error('Failed to create session');
      }

      // Generate JWT token with session info
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not configured');
      }
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          provider: 'email',
          sessionId: sessionData.sessionId,
          tokenId: sessionData.tokenId
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      console.log('[AuthController] ✅ User signup successful', { 
        userId: user._id, 
        email,
        sessionId: sessionData.sessionId
      });

      res.json({
        success: true,
        token,
        session: {
          sessionId: sessionData.sessionId,
          expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
        },
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          provider: user.provider
        },
        message: 'User created successfully'
      });

    } catch (error) {
      console.error('[AuthController] ❌ User signup failed:', {
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

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Create session
      const sessionData = await AuthController.createUserSession(user._id, req, false);
      if (!sessionData) {
        throw new Error('Failed to create session');
      }

      // Generate JWT token with session info
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not configured');
      }
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          provider: user.provider,
          sessionId: sessionData.sessionId,
          tokenId: sessionData.tokenId
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      console.log('[AuthController] ✅ User login successful', { 
        userId: user._id, 
        email,
        sessionId: sessionData.sessionId
      });

      res.json({
        success: true,
        token,
        session: {
          sessionId: sessionData.sessionId,
          expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
        },
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          provider: user.provider
        },
        message: 'Login successful'
      });

    } catch (error) {
      console.error('[AuthController] ❌ User login failed:', {
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

  // Logout
  async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // You could implement token blacklisting here if needed
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('[AuthController] ❌ User logout failed:', {
        error: error.message,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Verify token
  async verifyToken(req, res) {
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
        throw new Error('JWT_SECRET environment variable is not configured');
      }
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          provider: user.provider
        }
      });

    } catch (error) {
      console.error('[AuthController] ❌ Token verification failed:', {
        error: error.message,
        stack: error.stack
      });
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  }
}

export default new AuthController();
