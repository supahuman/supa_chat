import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Session identification
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // JWT token reference
  tokenId: {
    type: String,
    required: true
  },
  
  // Session metadata
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    os: String
  },
  
  // Network information
  ipAddress: {
    type: String,
    required: true
  },
  
  // Location data (if available)
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  
  // Session status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Payment session flag
  isPaymentSession: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Security flags
  isSuspicious: {
    type: Boolean,
    default: false
  },
  
  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Session lifecycle
  loginTime: {
    type: Date,
    default: Date.now
  },
  
  logoutTime: {
    type: Date
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ sessionId: 1, isActive: 1 });
sessionSchema.index({ tokenId: 1 });
sessionSchema.index({ ipAddress: 1, userId: 1 });
sessionSchema.index({ isPaymentSession: 1, isActive: 1 });

// Virtual for session duration
sessionSchema.virtual('duration').get(function() {
  const endTime = this.logoutTime || new Date();
  return endTime - this.loginTime;
});

// Virtual for isExpired
sessionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Method to extend session
sessionSchema.methods.extendSession = function(additionalHours = 24) {
  this.expiresAt = new Date(Date.now() + (additionalHours * 60 * 60 * 1000));
  this.lastActivity = new Date();
  return this.save();
};

// Method to deactivate session
sessionSchema.methods.deactivate = function() {
  this.isActive = false;
  this.logoutTime = new Date();
  return this.save();
};

// Static method to clean expired sessions
sessionSchema.statics.cleanExpiredSessions = async function() {
  const result = await this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      isActive: true 
    },
    { 
      isActive: false,
      logoutTime: new Date()
    }
  );
  return result;
};

// Static method to get active sessions for user
sessionSchema.statics.getActiveSessions = function(userId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ lastActivity: -1 });
};

// Ensure virtual fields are serialized
sessionSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model('Session', sessionSchema);
