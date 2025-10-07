import mongoose from 'mongoose';

/**
 * Escalation Schema - MongoDB model for handling escalation requests
 * Used when conversations need to be escalated to human agents
 */
const escalationSchema = new mongoose.Schema({
  // Escalation identification
  escalationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Related entities
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  companyId: {
    type: String,
    required: true,
    index: true
  },
  agentId: {
    type: String,
    required: true
  },
  
  // Escalation details
  reason: {
    type: String,
    required: true,
    enum: ['user_request', 'complex_query', 'system_error', 'timeout', 'satisfaction_low', 'other']
  },
  description: {
    type: String,
    maxlength: 1000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  
  // Assignment information
  assignedTo: {
    userId: String,
    name: String,
    email: String,
    assignedAt: Date
  },
  
  // Resolution details
  resolution: {
    type: String,
    maxlength: 2000
  },
  resolvedAt: Date,
  resolvedBy: {
    userId: String,
    name: String
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
escalationSchema.index({ companyId: 1, status: 1 });
escalationSchema.index({ companyId: 1, createdAt: -1 });
escalationSchema.index({ 'assignedTo.userId': 1, status: 1 });
escalationSchema.index({ priority: 1, status: 1 });

// Update the updatedAt field before saving
escalationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get escalation statistics
escalationSchema.statics.getEscalationStats = function(companyId, dateRange = {}) {
  const matchStage = { companyId };
  
  if (dateRange.start || dateRange.end) {
    matchStage.createdAt = {};
    if (dateRange.start) matchStage.createdAt.$gte = dateRange.start;
    if (dateRange.end) matchStage.createdAt.$lte = dateRange.end;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEscalations: { $sum: 1 },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        resolvedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $ne: ['$resolvedAt', null] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        },
        reasonBreakdown: {
          $push: '$reason'
        },
        priorityBreakdown: {
          $push: '$priority'
        }
      }
    }
  ]);
};

// Instance method to calculate resolution time
escalationSchema.methods.getResolutionTime = function() {
  if (!this.resolvedAt) return null;
  return this.resolvedAt - this.createdAt;
};

// Instance method to check if escalation is overdue
escalationSchema.methods.isOverdue = function() {
  if (this.status === 'resolved' || this.status === 'closed') return false;
  
  const now = new Date();
  const hoursSinceCreation = (now - this.createdAt) / (1000 * 60 * 60);
  
  // Define SLA thresholds based on priority
  const slaHours = {
    urgent: 1,
    high: 4,
    medium: 24,
    low: 72
  };
  
  return hoursSinceCreation > (slaHours[this.priority] || 24);
};

// Clear any existing model to avoid conflicts
if (mongoose.models.Escalation) {
  delete mongoose.models.Escalation;
}

const Escalation = mongoose.model('Escalation', escalationSchema);

export default Escalation;
