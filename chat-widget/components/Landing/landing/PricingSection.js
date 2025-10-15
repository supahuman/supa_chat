"use client";

import { useState } from "react";
import { Check, Zap, Star, Crown } from "lucide-react";
import paymentService from "../../../lib/paymentService";

const PricingSection = () => {
  const [isLoading, setIsLoading] = useState(null);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      icon: Zap,
      features: [
        "1 AI Agent",
        "1,000 messages/month",
        "Basic support",
        "Standard branding",
      ],
      limitations: ["Limited to 1 agent", "Basic features only"],
      cta: "Current Plan",
      ctaVariant: "outline",
      popular: false,
    },
    {
      name: "Starter",
      price: "$29",
      period: "per month",
      description: "Perfect for small businesses",
      icon: Star,
      features: [
        "3 AI Agents",
        "5,000 messages/month",
        "Custom branding",
        "Analytics dashboard",
        "Email support",
      ],
      limitations: [],
      cta: "Upgrade to Starter",
      ctaVariant: "primary",
      popular: true,
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      description: "For growing businesses",
      icon: Crown,
      features: [
        "10 AI Agents",
        "25,000 messages/month",
        "Custom branding",
        "Advanced analytics",
        "Priority support",
        "API access",
      ],
      limitations: [],
      cta: "Upgrade to Professional",
      ctaVariant: "primary",
      popular: false,
    },
  ];

  const handleUpgrade = async (planName) => {
    setIsLoading(planName);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      console.log("🔍 Upgrade Debug:", {
        planName,
        hasToken: !!token,
        hasUserId: !!userId,
        tokenPreview: token ? token.substring(0, 20) + "..." : "none",
      });

      if (!token || !userId) {
        // Redirect to signup if not logged in
        alert("Please log in first to upgrade your plan.");
        window.location.href = "/signup";
        return;
      }

      // Validate that userId is a proper ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
      if (!isValidObjectId) {
        alert("Invalid user session. Please log in again.");
        window.location.href = "/signup";
        return;
      }

      // Create checkout session using payment service
      const result = await paymentService.createCheckoutSession(planName);

      // Redirect to Stripe checkout
      window.location.href = result.url;
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to start upgrade process: " + error.message);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <section
      id="pricing"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any
            time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                  plan.popular
                    ? "border-blue-500 scale-105"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                        plan.popular
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Limitations:
                      </h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-500 dark:text-gray-400"
                          >
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={isLoading === plan.name || plan.name === "Free"}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                      plan.name === "Free"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : plan.ctaVariant === "primary"
                        ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        : "border-2 border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {isLoading === plan.name ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need More?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              For large organizations with unlimited agents and messages, custom
              integrations, and dedicated support.
            </p>
            <button
              onClick={() => handleUpgrade("ENTERPRISE")}
              disabled={isLoading === "ENTERPRISE"}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading === "ENTERPRISE" ? "Processing..." : "Contact Sales"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
