import express from 'express';
import authController from '../../controller/auth/authController.js';

const router = express.Router();

// Google OAuth signup
router.post('/google-signup', authController.googleSignup);

// Regular signup
router.post('/signup', authController.signup);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Verify token
router.get('/verify', authController.verifyToken);

export default router;