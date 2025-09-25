import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Premium subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PREMIUM: "premium", 
  PRO: "pro",
} as const;

export const subscriptionTierValidator = v.union(
  v.literal(SUBSCRIPTION_TIERS.FREE),
  v.literal(SUBSCRIPTION_TIERS.PREMIUM),
  v.literal(SUBSCRIPTION_TIERS.PRO),
);
export type SubscriptionTier = Infer<typeof subscriptionTierValidator>;

// Subscription status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired", 
  CANCELLED: "cancelled",
  TRIAL: "trial",
  PAST_DUE: "past_due",
} as const;

export const subscriptionStatusValidator = v.union(
  v.literal(SUBSCRIPTION_STATUS.ACTIVE),
  v.literal(SUBSCRIPTION_STATUS.EXPIRED),
  v.literal(SUBSCRIPTION_STATUS.CANCELLED), 
  v.literal(SUBSCRIPTION_STATUS.TRIAL),
  v.literal(SUBSCRIPTION_STATUS.PAST_DUE),
);
export type SubscriptionStatus = Infer<typeof subscriptionStatusValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      // Profile fields
      age: v.optional(v.number()),
      weight: v.optional(v.number()),

      // Premium subscription fields
      subscriptionTier: v.optional(subscriptionTierValidator), // defaults to "free"
      subscriptionStatus: v.optional(subscriptionStatusValidator), // current status
      subscriptionStart: v.optional(v.number()), // when subscription started (timestamp)
      subscriptionEnd: v.optional(v.number()), // when subscription expires (timestamp)
      trialEnd: v.optional(v.number()), // when trial expires (timestamp)
      customerId: v.optional(v.string()), // Stripe/payment provider customer ID
      subscriptionId: v.optional(v.string()), // Stripe/payment provider subscription ID
    }).index("email", ["email"]) // index for the email. do not remove or modify
    .index("customerId", ["customerId"]) // index for payment provider lookups
    .index("subscriptionTier", ["subscriptionTier"]), // index for tier-based queries

    exercises: defineTable({
      userId: v.id("users"),
      name: v.string(),
      category: v.string(),
      // Legacy fields for backward compatibility (deprecated)
      sets: v.optional(v.number()),
      reps: v.optional(v.number()),
      weight: v.optional(v.number()),
      // New field: array of sets with individual values
      setsData: v.optional(v.array(v.object({
        reps: v.number(),
        weight: v.optional(v.number()),
        notes: v.optional(v.string()),
      }))),
      // Keep duration and notes for cardio/time-based exercises
      duration: v.optional(v.number()),
      notes: v.optional(v.string()),
      // When the exercise was actually performed (allows logging to any date)
      performedAt: v.number(),
    })
      .index("by_user", ["userId"])
      // Add composite index to support category filtering efficiently
      .index("by_user_and_category", ["userId", "category"])
      // For date range and name-based queries and comparisons
      .index("by_user_and_name_and_performedAt", ["userId", "name", "performedAt"])
      // Added: for fast date range exports across all exercises
      .index("by_user_and_performedAt", ["userId", "performedAt"]),

    // Added: Exercise Library table
    exerciseLibrary: defineTable({
      name: v.string(),
      nameLower: v.string(), // for prefix search
      category: v.string(), // e.g., Strength, Cardio, Mobility
      primaryMuscle: v.string(), // e.g., Chest, Back, Legs
      difficulty: v.string(), // e.g., Beginner, Intermediate, Advanced
      equipment: v.string(), // e.g., Barbell, Dumbbell, Bodyweight
      description: v.string(),
      tips: v.optional(v.string()),
      commonMistakes: v.optional(v.string()),
      mediaUrl: v.optional(v.string()), // optional image/gif/video
      popularity: v.optional(v.number()),
    })
      .index("by_nameLower", ["nameLower"])
      .index("by_category", ["category"])
      .index("by_difficulty", ["difficulty"])
      .index("by_equipment", ["equipment"]),

    // Workout Templates table
    workoutTemplates: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      category: v.string(), // "Push/Pull/Legs", "Upper/Lower", "Full Body", etc.
      difficulty: v.string(), // "Beginner", "Intermediate", "Advanced"
      estimatedDuration: v.number(), // minutes
      exercises: v.array(v.object({
        name: v.string(),
        category: v.string(),
        targetSets: v.number(),
        targetReps: v.string(), // "8-10" or "8" - flexible format
        targetWeight: v.optional(v.number()), // optional suggested weight
        restTime: v.number(), // seconds
        notes: v.optional(v.string()),
        order: v.number(), // exercise order in template
      })),
      isPreBuilt: v.boolean(), // true for curated templates, false for user-created
      createdBy: v.optional(v.id("users")), // null for pre-built templates
      lastUsed: v.optional(v.number()), // timestamp when user last used this template
      usageCount: v.optional(v.number()), // how many times user has used this template
    })
      .index("by_user", ["createdBy"])
      .index("by_category", ["category"])
      .index("by_prebuilt", ["isPreBuilt"])
      .index("by_user_and_category", ["createdBy", "category"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;