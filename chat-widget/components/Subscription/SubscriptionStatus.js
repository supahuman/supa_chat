'use client';

import { useState, useEffect } from 'react';
import { Crown, Star, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import paymentService from '../../lib/paymentService';

const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const subscriptionData = await paymentService.getSubscriptionStatus();
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError(error.message || 'Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'FREE': return Zap;
      case 'STARTER': return Star;
      case 'PROFESSIONAL': return Crown;
      case 'ENTERPRISE': return Crown;
      default: return Zap;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'FREE': return 'text-gray-600 bg-gray-100';
      case 'STARTER': return 'text-blue-600 bg-blue-100';
      case 'PROFESSIONAL': return 'text-purple-600 bg-purple-100';
      case 'ENTERPRISE': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanLimits = (plan) => {
    return paymentService.getPlanLimits(plan);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-600 dark:text-red-400">Error loading subscription: {error}</span>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
          <span className="text-yellow-600 dark:text-yellow-400">No subscription found</span>
        </div>
      </div>
    );
  }

  const Icon = getPlanIcon(subscription.plan);
  const limits = getPlanLimits(subscription.plan);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${getPlanColor(subscription.plan)}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {subscription.plan} Plan
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subscription.status === 'active' ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {subscription.status === 'active' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Plan Limits */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {limits.agents}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            AI Agents
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {limits.messages}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Messages/Month
          </div>
        </div>
      </div>

      {/* Agent Creation Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Can Create More Agents
          </span>
          <span className={`text-sm font-medium ${
            subscription.canCreateMoreAgents 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {subscription.canCreateMoreAgents ? 'Yes' : 'No'}
          </span>
        </div>
        {!subscription.canCreateMoreAgents && (
          <p className="text-xs text-red-600 dark:text-red-400">
            You&apos;ve reached your agent limit. Upgrade to create more agents.    
          </p>
        )}
      </div>

      {/* Billing Info */}
      {subscription.currentPeriodEnd && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {subscription.plan === 'FREE' ? (
            'Free plan - no billing'
          ) : (
            `Billing period ends: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
          )}
        </div>
      )}

      {/* Upgrade Button */}
      {subscription.plan === 'FREE' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => window.location.href = '/#pricing'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
