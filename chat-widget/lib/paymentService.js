/**
 * Frontend payment service for handling Stripe checkout sessions
 */

class PaymentService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    console.log("🔍 Payment Service Debug:", {
      hasToken: !!token,
      hasUserId: !!userId,
      tokenPreview: token ? token.substring(0, 20) + "..." : "none",
      userId: userId || "none",
    });

    if (!token || !userId) {
      throw new Error("User not authenticated. Please log in first.");
    }

    return {
      "Content-Type": "application/json",
      "X-User-ID": userId,
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Create checkout session for subscription upgrade
   */
  async createCheckoutSession(plan, successUrl, cancelUrl) {
    try {
      console.log("🚀 Creating checkout session for plan:", plan);
      console.log("🌐 Base URL:", this.baseUrl);

      const headers = this.getAuthHeaders();
      const body = {
        plan: plan.toUpperCase(),
        successUrl:
          successUrl ||
          `${window.location.origin}/agent-builder?upgrade=success`,
        cancelUrl: cancelUrl || `${window.location.origin}/?upgrade=canceled`,
      };

      console.log("📤 Request body:", body);
      console.log("📤 Request headers:", headers);

      const response = await fetch(
        `${this.baseUrl}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body),
        }
      );

      console.log("📥 Response status:", response.status);
      console.log(
        "📥 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const result = await response.json();
      console.log("📥 Response body:", result);

      if (!result.success) {
        throw new Error(result.error || "Failed to create checkout session");
      }

      return result;
    } catch (error) {
      console.error("❌ Payment service error:", error);
      throw error;
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/payment/subscription`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to get subscription status");
      }

      return result.data;
    } catch (error) {
      console.error("Subscription service error:", error);
      throw error;
    }
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(returnUrl) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/payment/create-portal-session`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            returnUrl: returnUrl || `${window.location.origin}/dashboard`,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create portal session");
      }

      return result;
    } catch (error) {
      console.error("Portal service error:", error);
      throw error;
    }
  }

  /**
   * Check if user can create more agents
   */
  async canCreateAgent() {
    try {
      const subscription = await this.getSubscriptionStatus();
      return subscription.canCreateMoreAgents;
    } catch (error) {
      console.error("Agent limit check error:", error);
      return false; // Default to false for safety
    }
  }

  /**
   * Get plan limits
   */
  getPlanLimits(plan) {
    const limits = {
      FREE: { agents: 1, messages: 1000 },
      STARTER: { agents: 3, messages: 5000 },
      PROFESSIONAL: { agents: 10, messages: 25000 },
      ENTERPRISE: { agents: "Unlimited", messages: "Unlimited" },
    };
    return limits[plan] || limits.FREE;
  }

  /**
   * Get plan pricing
   */
  getPlanPricing(plan) {
    const pricing = {
      FREE: { price: 0, period: "forever" },
      STARTER: { price: 29, period: "per month" },
      PROFESSIONAL: { price: 99, period: "per month" },
      ENTERPRISE: { price: 299, period: "per month" },
    };
    return pricing[plan] || pricing.FREE;
  }
}

export default new PaymentService();
