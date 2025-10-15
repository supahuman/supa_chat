/**
 * PaymentService - Handles Stripe payments and subscriptions
 */

import Stripe from "stripe";

class PaymentService {
  constructor() {
    this.stripe = null; // Initialize as null, will be set when needed
    this.PLANS = {}; // Will be populated dynamically
  }

  getPlans() {
    // Read environment variables dynamically each time
    return {
      STARTER: {
        priceId: process.env.STRIPE_STARTER_PRICE_ID,
        amount: 2900, // $29.00
        interval: "month",
      },
      PROFESSIONAL: {
        priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
        amount: 9900, // $99.00
        interval: "month",
      },
      ENTERPRISE: {
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        amount: 29900, // $299.00
        interval: "month",
      },
    };
  }

  /**
   * Get Stripe instance (lazy initialization)
   */
  getStripe() {
    if (!this.stripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY environment variable is not set");
      }
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return this.stripe;
  }

  /**
   * Create Stripe customer
   */
  async createCustomer(userData) {
    try {
      const stripe = this.getStripe();
      const customer = await stripe.customers.create({
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        metadata: {
          userId: userData.id,
          companyId: userData.companyId || "",
        },
      });

      return customer;
    } catch (error) {
      console.error("Error creating Stripe customer:", error);
      throw error;
    }
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(customerId, plan, successUrl, cancelUrl) {
    try {
      const plans = this.getPlans();
      const planConfig = plans[plan];
      if (!planConfig) {
        throw new Error(`Invalid plan: ${plan}`);
      }

      if (!planConfig.priceId) {
        throw new Error(
          `Price ID not configured for plan: ${plan}. Please set STRIPE_${plan}_PRICE_ID environment variable.`
        );
      }

      const stripe = this.getStripe();

      const sessionData = {
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: planConfig.priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          plan: plan,
        },
      };

      const session = await stripe.checkout.sessions.create(sessionData);

      return session;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  }

  /**
   * Handle successful subscription
   */
  async handleSubscriptionSuccess(sessionId) {
    try {
      const stripe = this.getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      // Update user's subscription in database
      const Subscription = (await import("../models/subscriptionModel.js"))
        .default;
      const plan = session.metadata.plan;

      await Subscription.findOneAndUpdate(
        { stripeCustomerId: subscription.customer },
        {
          plan: plan,
          status: subscription.status,
          stripeSubscriptionId: subscription.id,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        { upsert: true, new: true }
      );

      return { success: true, plan, subscription };
    } catch (error) {
      console.error("Error handling subscription success:", error);
      throw error;
    }
  }

  /**
   * Handle subscription cancellation
   */
  async cancelSubscription(subscriptionId) {
    try {
      const stripe = this.getStripe();
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Update database
      const Subscription = (await import("../models/subscriptionModel.js"))
        .default;
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        { status: "canceled" }
      );

      return { success: true, subscription };
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  }

  /**
   * Get customer portal session
   */
  async createPortalSession(customerId, returnUrl) {
    try {
      const stripe = this.getStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error("Error creating portal session:", error);
      throw error;
    }
  }
}

export default new PaymentService();
