import Session from '../models/sessionModel.js';
import cron from 'node-cron';

/**
 * Session cleanup job
 * Runs every hour to clean expired sessions
 */
class SessionCleanupJob {
  constructor() {
    this.isRunning = false;
  }

  async cleanupExpiredSessions() {
    if (this.isRunning) {
      console.log('[SessionCleanupJob] ⏳ Cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      console.log('[SessionCleanupJob] 🧹 Starting session cleanup...');
      
      const result = await Session.cleanExpiredSessions();
      
      console.log('[SessionCleanupJob] ✅ Session cleanup completed', {
        cleanedCount: result.modifiedCount,
        timestamp: new Date().toISOString()
      });

      // Also clean sessions that are inactive for more than 30 days
      const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
      const oldSessionsResult = await Session.updateMany(
        {
          isActive: false,
          lastActivity: { $lt: thirtyDaysAgo }
        },
        {
          $set: { 
            // Mark for deletion (you might want to actually delete these)
            metadata: { markedForDeletion: true, markedAt: new Date() }
          }
        }
      );

      if (oldSessionsResult.modifiedCount > 0) {
        console.log('[SessionCleanupJob] 🗑️ Marked old sessions for deletion', {
          markedCount: oldSessionsResult.modifiedCount
        });
      }

    } catch (error) {
      console.error('[SessionCleanupJob] ❌ Session cleanup failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    // Run cleanup every hour
    cron.schedule('0 * * * *', () => {
      this.cleanupExpiredSessions();
    });

    // Also run cleanup on startup
    this.cleanupExpiredSessions();

    console.log('[SessionCleanupJob] 🚀 Session cleanup job started (runs every hour)');
  }

  stop() {
    cron.destroy();
    console.log('[SessionCleanupJob] ⏹️ Session cleanup job stopped');
  }
}

export default new SessionCleanupJob();
