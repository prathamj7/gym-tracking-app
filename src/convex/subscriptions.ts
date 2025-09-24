import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserIdentity } from "./auth";
import { 
  SUBSCRIPTION_TIERS, 
  SUBSCRIPTION_STATUS, 
  SubscriptionTier, 
  SubscriptionStatus,
  subscriptionStatusValidator 
} from "./schema";

// Get current user's subscription info
export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getCurrentUserIdentity(ctx);
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) return null;

    return {
      tier: user.subscriptionTier || SUBSCRIPTION_TIERS.FREE,
      status: user.subscriptionStatus || SUBSCRIPTION_STATUS.ACTIVE,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      trialEnd: user.trialEnd,
      customerId: user.customerId,
      subscriptionId: user.subscriptionId,
    };
  },
});

// Check if user has premium access
export const hasUserPremiumAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getCurrentUserIdentity(ctx);
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) return false;

    const tier = user.subscriptionTier || SUBSCRIPTION_TIERS.FREE;
    const status = user.subscriptionStatus || SUBSCRIPTION_STATUS.ACTIVE;

    // User has premium access if:
    // 1. They have premium or pro tier AND
    // 2. Their subscription is active OR in trial OR they're in grace period
    const hasPremiumTier = tier === SUBSCRIPTION_TIERS.PREMIUM || tier === SUBSCRIPTION_TIERS.PRO;
    const hasActiveStatus = status === SUBSCRIPTION_STATUS.ACTIVE || status === SUBSCRIPTION_STATUS.TRIAL;
    
    // Check if trial is still valid
    const isTrialValid = user.trialEnd ? user.trialEnd > Date.now() : false;
    
    // Check if subscription is still valid (with 3-day grace period for past_due)
    const isSubscriptionValid = user.subscriptionEnd ? 
      (user.subscriptionEnd + (3 * 24 * 60 * 60 * 1000)) > Date.now() : false;

    return hasPremiumTier && (hasActiveStatus || isTrialValid || isSubscriptionValid);
  },
});

// Upgrade user to premium
export const upgradeUserToPremium = mutation({
  args: {
    tier: v.union(v.literal("premium"), v.literal("pro")),
    customerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    subscriptionEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await getCurrentUserIdentity(ctx);
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      subscriptionTier: args.tier as SubscriptionTier,
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE as SubscriptionStatus,
      subscriptionStart: Date.now(),
      subscriptionEnd: args.subscriptionEnd,
      customerId: args.customerId,
      subscriptionId: args.subscriptionId,
    });

    return { success: true };
  },
});

// Start free trial
export const startFreeTrial = mutation({
  args: {
    trialDays: v.number(), // Usually 7 or 14 days
  },
  handler: async (ctx, args) => {
    const identity = await getCurrentUserIdentity(ctx);
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) throw new Error("User not found");

    // Check if user already had a trial
    if (user.trialEnd) {
      throw new Error("Trial already used");
    }

    const trialEnd = Date.now() + (args.trialDays * 24 * 60 * 60 * 1000);

    await ctx.db.patch(user._id, {
      subscriptionTier: SUBSCRIPTION_TIERS.PREMIUM as SubscriptionTier,
      subscriptionStatus: SUBSCRIPTION_STATUS.TRIAL as SubscriptionStatus,
      trialEnd,
    });

    return { success: true, trialEnd };
  },
});

// Cancel subscription (downgrade to free)
export const cancelSubscription = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await getCurrentUserIdentity(ctx);
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      subscriptionTier: SUBSCRIPTION_TIERS.FREE as SubscriptionTier,
      subscriptionStatus: SUBSCRIPTION_STATUS.CANCELLED as SubscriptionStatus,
    });

    return { success: true };
  },
});

// Update subscription status (for webhook calls)
export const updateSubscriptionStatus = mutation({
  args: {
    customerId: v.string(),
    status: subscriptionStatusValidator,
    subscriptionEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("customerId", (q) => q.eq("customerId", args.customerId))
      .first();

    if (!user) throw new Error("User not found");

    const updates: any = {
      subscriptionStatus: args.status,
    };

    // If subscription expired or cancelled, downgrade to free
    if (args.status === SUBSCRIPTION_STATUS.EXPIRED || args.status === SUBSCRIPTION_STATUS.CANCELLED) {
      updates.subscriptionTier = SUBSCRIPTION_TIERS.FREE;
    }

    if (args.subscriptionEnd) {
      updates.subscriptionEnd = args.subscriptionEnd;
    }

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});

// Get subscription statistics (admin only)
export const getSubscriptionStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getCurrentUserIdentity(ctx);
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const allUsers = await ctx.db.query("users").collect();
    
    const stats = {
      total: allUsers.length,
      free: allUsers.filter(u => (u.subscriptionTier || SUBSCRIPTION_TIERS.FREE) === SUBSCRIPTION_TIERS.FREE).length,
      premium: allUsers.filter(u => u.subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM).length,
      pro: allUsers.filter(u => u.subscriptionTier === SUBSCRIPTION_TIERS.PRO).length,
      trial: allUsers.filter(u => u.subscriptionStatus === SUBSCRIPTION_STATUS.TRIAL).length,
      active: allUsers.filter(u => u.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE).length,
    };

    return stats;
  },
});