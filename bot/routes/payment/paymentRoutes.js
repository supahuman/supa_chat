import express from "express";
import PaymentService from "../../services/PaymentService.js";
import SubscriptionService from "../../services/SubscriptionService.js";
import { authenticatePayment } from "../../middleware/paymentAuth.js";

const router = express.Router();

// Webhook endpoint doesn't require API key authentication (Stripe handles this)
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = PaymentService.getStripe().webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      if (session.mode === "subscription") {
        try {
          await PaymentService.handleSubscriptionSuccess(session.id);
          console.log(
            `✅ Processed checkout.session.completed for session: ${session.id}`
          );
        } catch (error) {
          console.error(
            `❌ Error processing checkout.session.completed for session: ${session.id}`,
            error.message
          );
          // Don't throw - just log the error to prevent webhook failures
        }
      }
      break;
    case "customer.subscription.updated":
      const subscription = event.data.object;
      console.log(`📝 Subscription updated: ${subscription.id}`);
      // Handle subscription updates
      break;
    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object;
      console.log(`🗑️ Subscription deleted: ${deletedSubscription.id}`);
      // Handle subscription cancellation
      break;
    default:
      console.log(`📋 Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// All other routes require payment authentication
router.use(authenticatePayment);

/**
 * Create checkout session for subscription upgrade
 */
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId, companyId } = req;
    const { plan, successUrl, cancelUrl } = req.body;

    // Validate plan
    const validPlans = ["STARTER", "PROFESSIONAL", "ENTERPRISE"];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan selected",
      });
    }

    // Get user data
    const User = (await import("../../models/userModel.js")).default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get or create Stripe customer
    const Subscription = (await import("../../models/subscriptionModel.js"))
      .default;
    let subscription = await Subscription.findOne({ userId });

    let customerId = subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await PaymentService.createCustomer({
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId,
      });
      customerId = customer.id;

      // Update subscription with customer ID
      if (subscription) {
        subscription.stripeCustomerId = customerId;
        await subscription.save();
      }
    }

    // Create checkout session
    const session = await PaymentService.createCheckoutSession(
      customerId,
      plan,
      successUrl || `${process.env.FRONTEND_URL}/agent-builder?upgrade=success`,
      cancelUrl || `${process.env.FRONTEND_URL}/?upgrade=canceled`
    );

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
    });
  }
});

/**
 * Create customer portal session
 */
router.post("/create-portal-session", async (req, res) => {
  try {
    const { userId } = req;
    const { returnUrl } = req.body;

    // Get user's subscription
    const Subscription = (await import("../../models/subscriptionModel.js"))
      .default;
    const subscription = await Subscription.findOne({ userId });

    if (!subscription?.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        error: "No subscription found",
      });
    }

    const session = await PaymentService.createPortalSession(
      subscription.stripeCustomerId,
      returnUrl || `${process.env.FRONTEND_URL}/dashboard`
    );

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create portal session",
    });
  }
});

/**
 * Get current subscription status
 */
router.get("/subscription", async (req, res) => {
  try {
    const { userId } = req;
    const subscription = await SubscriptionService.getUserSubscription(userId);

    res.json({
      success: true,
      data: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        canCreateMoreAgents: (await subscription.canCreateAgent()).canCreate,
      },
    });
  } catch (error) {
    console.error("Error getting subscription:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get subscription",
    });
  }
});

export default router;
