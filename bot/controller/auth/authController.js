import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/userModel.js';
import BaseController from '../shared/baseController.js';

class AuthController extends BaseController {

  // Google OAuth signup
  async googleSignup(req, res) {
    try {
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
          { email: email },
          { googleId: googleId }
        ]
      });

      if (user) {
        // User exists, update Google ID if missing
        if (!user.googleId) {
          user.googleId = googleId;
          user.profilePicture = profilePicture;
          await user.save();
        }
      } else {
        // Create new user
        user = new User({
          googleId,
          email,
          firstName,
          lastName,
          profilePicture,
          emailVerified,
          provider: 'google',
          isActive: true
        });
        await user.save();
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not configured');
      }
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          provider: 'google'
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      console.log('[AuthController] ✅ Google signup successful', { userId: user._id, email });

      res.json({
        success: true,
        token,
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
        body: req.body
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
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

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not configured');
      }
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          provider: 'email'
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      console.log('[AuthController] ✅ User signup successful', { userId: user._id, email });

      res.json({
        success: true,
        token,
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

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not configured');
      }
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          provider: user.provider
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      console.log('[AuthController] ✅ User login successful', { userId: user._id, email });

      res.json({
        success: true,
        token,
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
