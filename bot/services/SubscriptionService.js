/**
 * SubscriptionService - Handles user subscription limits and validation
 */

class SubscriptionService {
  constructor() {
    this.PLANS = {
      FREE: {
        name: 'Free',
        maxAgents: 1,
        maxMessagesPerMonth: 1000,
        maxKnowledgeItems: 50,
        customBranding: false,
        analytics: false,
        prioritySupport: false
      },
      STARTER: {
        name: 'Starter',
        maxAgents: 3,
        maxMessagesPerMonth: 5000,
        maxKnowledgeItems: 200,
        customBranding: true,
        analytics: true,
        prioritySupport: false
      },
      PROFESSIONAL: {
        name: 'Professional',
        maxAgents: 10,
        maxMessagesPerMonth: 25000,
        maxKnowledgeItems: 1000,
        customBranding: true,
        analytics: true,
        prioritySupport: true
      },
      ENTERPRISE: {
        name: 'Enterprise',
        maxAgents: -1, // Unlimited
        maxMessagesPerMonth: -1, // Unlimited
        maxKnowledgeItems: -1, // Unlimited
        customBranding: true,
        analytics: true,
        prioritySupport: true
      }
    };
  }

  /**
   * Get user's current subscription from database
   */
  async getUserSubscription(userId) {
    try {
      const Subscription = (await import('../models/subscriptionModel.js')).default;
      let subscription = await Subscription.findOne({ userId });
      
      // Create FREE subscription if none exists
      if (!subscription) {
        subscription = new Subscription({
          userId,
          plan: 'FREE',
          status: 'active'
        });
        await subscription.save();
      }
      
      return subscription;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      // Fallback to FREE plan
      return {
        plan: 'FREE',
        planLimits: this.PLANS.FREE,
        isActive: () => true,
        canCreateAgent: async () => ({ canCreate: true, reason: null })
      };
    }
  }

  /**
   * Get user's current plan
   */
  async getUserPlan(userId) {
    const subscription = await this.getUserSubscription(userId);
    return subscription.planLimits || this.PLANS.FREE;
  }

  /**
   * Check if user can create more agents
   */
  async canCreateAgent(userId, companyId) {
    const subscription = await this.getUserSubscription(userId);
    const plan = subscription.planLimits;
    
    // If unlimited agents
    if (plan.maxAgents === -1) {
      return { canCreate: true, reason: null };
    }

    // Count existing agents for this user/company
    const Agent = (await import('../models/agentModel.js')).default;
    const agentCount = await Agent.countDocuments({ 
      $or: [
        { createdBy: userId },
        { companyId: companyId }
      ]
    });

    if (agentCount >= plan.maxAgents) {
      return {
        canCreate: false,
        reason: `You've reached the limit of ${plan.maxAgents} agent${plan.maxAgents > 1 ? 's' : ''} for the ${subscription.plan} plan. Upgrade to create more agents.`,
        currentCount: agentCount,
        maxAllowed: plan.maxAgents,
        plan: subscription.plan
      };
    }

    return { 
      canCreate: true, 
      reason: null,
      currentCount: agentCount,
      maxAllowed: plan.maxAgents,
      plan: subscription.plan
    };
  }

  /**
   * Get upgrade options for user
   */
  getUpgradeOptions(currentPlan) {
    const allPlans = Object.values(this.PLANS);
    return allPlans.filter(plan => plan.maxAgents > currentPlan.maxAgents);
  }

  /**
   * Check if user can use custom branding
   */
  canUseCustomBranding(userId) {
    const plan = this.getUserPlan(userId);
    return plan.customBranding;
  }

  /**
   * Check if user can access analytics
   */
  canAccessAnalytics(userId) {
    const plan = this.getUserPlan(userId);
    return plan.analytics;
  }
}

export default new SubscriptionService();
