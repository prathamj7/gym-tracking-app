import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Hook to get user's subscription info
export function useSubscription() {
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  
  return {
    subscription,
    isLoading: subscription === undefined,
  };
}

// Hook to check if user has premium access
export function usePremiumAccess() {
  const hasPremium = useQuery(api.subscriptions.hasUserPremiumAccess);
  
  return {
    hasPremium,
    isLoading: hasPremium === undefined,
    isPremium: hasPremium === true,
    isFree: hasPremium === false,
  };
}

// Utility function to check subscription tier
export function useSubscriptionTier() {
  const { subscription, isLoading } = useSubscription();
  
  return {
    tier: subscription?.tier || "free",
    isLoading,
    isFree: subscription?.tier === "free" || !subscription?.tier,  
    isPremium: subscription?.tier === "premium",
    isPro: subscription?.tier === "pro",
    isTrialActive: subscription?.trialEnd ? subscription.trialEnd > Date.now() : false,
    trialDaysLeft: subscription?.trialEnd ? 
      Math.max(0, Math.ceil((subscription.trialEnd - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
  };
}

// Utility function to get subscription status info
export function useSubscriptionStatus() {
  const { subscription, isLoading } = useSubscription();
  
  const now = Date.now();
  const isExpired = subscription?.subscriptionEnd ? subscription.subscriptionEnd < now : false;
  const daysUntilExpiry = subscription?.subscriptionEnd ? 
    Math.ceil((subscription.subscriptionEnd - now) / (1000 * 60 * 60 * 24)) : null;
  
  return {
    status: subscription?.status || "active",
    isLoading,
    isActive: subscription?.status === "active",
    isExpired,
    isTrial: subscription?.status === "trial",
    isPastDue: subscription?.status === "past_due",
    daysUntilExpiry,
    subscriptionEnd: subscription?.subscriptionEnd,
  };
}

// Premium feature gate utility types
export type FeatureGateProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiresPremium?: boolean;
  requiresPro?: boolean;
  showUpgrade?: boolean;
};

// Feature limits for different tiers
export const FEATURE_LIMITS = {
  free: {
    exercisesPerDay: 5,
    templatesCount: 0,
    aiChatsPerDay: 0,
    exportData: false,
    advancedStats: false,
  },
  premium: {
    exercisesPerDay: 50,
    templatesCount: 10,
    aiChatsPerDay: 20,
    exportData: true,
    advancedStats: true,
  },
  pro: {
    exercisesPerDay: -1, // unlimited
    templatesCount: -1, // unlimited  
    aiChatsPerDay: -1, // unlimited
    exportData: true,
    advancedStats: true,
  },
} as const;

// Hook to get feature limits for current user
export function useFeatureLimits() {
  const { tier, isLoading } = useSubscriptionTier();
  
  return {
    limits: FEATURE_LIMITS[tier as keyof typeof FEATURE_LIMITS] || FEATURE_LIMITS.free,
    isLoading,
  };
}

// Utility to check if a feature is available
export function useFeatureAccess(feature: keyof typeof FEATURE_LIMITS.free) {
  const { limits, isLoading } = useFeatureLimits();
  
  return {
    hasAccess: limits[feature] === true || limits[feature] === -1 || (typeof limits[feature] === 'number' && limits[feature] > 0),
    limit: limits[feature],
    isLoading,
  };
}