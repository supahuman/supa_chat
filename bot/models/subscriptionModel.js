import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Company reference (if applicable)
  companyId: {
    type: String,
    required: false
  },
  
  // Subscription details
  plan: {
    type: String,
    enum: ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
    default: 'FREE'
  },
  
  // Payment details
  stripeCustomerId: {
    type: String,
    required: false
  },
  
  stripeSubscriptionId: {
    type: String,
    required: false
  },
  
  // Subscription status
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
    default: 'active'
  },
  
  // Billing cycle
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  
  currentPeriodEnd: {
    type: Date,
    default: function() {
      // Free plan never expires, paid plans expire in 30 days
      if (this.plan === 'FREE') {
        return null;
      }
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  
  // Usage tracking
  usage: {
    agentsCreated: {
      type: Number,
      default: 0
    },
    messagesThisMonth: {
      type: Number,
      default: 0
    },
    knowledgeItemsAdded: {
      type: Number,
      default: 0
    }
  },
  
  // Trial information
  trialEnd: {
    type: Date,
    required: false
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ companyId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ status: 1 });

// Virtual for plan limits
subscriptionSchema.virtual('planLimits').get(function() {
  const limits = {
    FREE: {
      maxAgents: 1,
      maxMessagesPerMonth: 1000,
      maxKnowledgeItems: 50,
      customBranding: false,
      analytics: false,
      prioritySupport: false
    },
    STARTER: {
      maxAgents: 3,
      maxMessagesPerMonth: 5000,
      maxKnowledgeItems: 200,
      customBranding: true,
      analytics: true,
      prioritySupport: false
    },
    PROFESSIONAL: {
      maxAgents: 10,
      maxMessagesPerMonth: 25000,
      maxKnowledgeItems: 1000,
      customBranding: true,
      analytics: true,
      prioritySupport: true
    },
    ENTERPRISE: {
      maxAgents: -1, // Unlimited
      maxMessagesPerMonth: -1, // Unlimited
      maxKnowledgeItems: -1, // Unlimited
      customBranding: true,
      analytics: true,
      prioritySupport: true
    }
  };
  
  return limits[this.plan] || limits.FREE;
});

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  if (this.plan === 'FREE') return true;
  if (this.status === 'active') return true;
  if (this.status === 'trialing' && this.trialEnd && this.trialEnd > new Date()) return true;
  return false;
};

// Method to check if user can create more agents
subscriptionSchema.methods.canCreateAgent = async function() {
  const limits = this.planLimits;
  if (limits.maxAgents === -1) return { canCreate: true, reason: null };
  
  if (this.usage.agentsCreated >= limits.maxAgents) {
    return {
      canCreate: false,
      reason: `You've reached the limit of ${limits.maxAgents} agent${limits.maxAgents > 1 ? 's' : ''} for the ${this.plan} plan.`,
      currentCount: this.usage.agentsCreated,
      maxAllowed: limits.maxAgents
    };
  }
  
  return { canCreate: true, reason: null };
};

export default mongoose.model('Subscription', subscriptionSchema);
