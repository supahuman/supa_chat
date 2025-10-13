import express from 'express';
import sessionController from '../../controller/session/sessionController.js';

const router = express.Router();

// Create new session
router.post('/create', sessionController.createSession);

// Get active sessions for user
router.get('/user/:userId', sessionController.getUserSessions);

// Get specific session
router.get('/:sessionId', sessionController.getSession);

// Update session activity
router.put('/:sessionId/activity', sessionController.updateSessionActivity);

// Deactivate specific session (logout)
router.put('/:sessionId/deactivate', sessionController.deactivateSession);

// Deactivate all sessions for user (logout all devices)
router.put('/user/:userId/deactivate-all', sessionController.deactivateAllUserSessions);

// Clean expired sessions (admin endpoint)
router.post('/cleanup', sessionController.cleanExpiredSessions);

export default router;
