/**
 * Workout Templates - Convex Backend Functions
 * 
 * This file handles all server-side operations for user-created workout templates:
 * - CRUD operations for templates
 * - Template usage tracking
 * - Template logging to workouts
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Template category constants
export const TEMPLATE_CATEGORIES = [
  "Push/Pull/Legs",
  "Upper/Lower", 
  "Full Body",
  "Body Part Split",
  "Strength Program",
  "Quick Workout",
  "Custom"
] as const;

export const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate", 
  "Advanced"
] as const;

// Get all user's personal templates
export const getAllTemplates = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get user's personal templates only
    const userTemplates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .collect();

    return userTemplates;
  },
});

// Get user templates by category
export const getTemplatesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get user's templates in category only
    const userTemplates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user_and_category", (q) => 
        q.eq("createdBy", user._id).eq("category", args.category)
      )
      .collect();

    return userTemplates;
  },
});

// Get user's personal templates only
export const getUserTemplates = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .collect();
  },
});

// Get single template by ID
export const getTemplateById = query({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, { templateId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const template = await ctx.db.get(templateId);
    if (!template) return null;

    // User can only access their own templates
    if (template.createdBy !== user._id) return null;

    return template;
  },
});

// Get user template count (for limit checking)
export const getUserTemplateCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return 0;

    const templates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .collect();

    return templates.length;
  },
});

// Track template usage (when user logs a template)
export const trackTemplateUsage = mutation({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, { templateId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");

    // Verify user owns the template
    if (template.createdBy !== user._id) {
      throw new Error("Not authorized to track usage for this template");
    }

    // Update usage tracking
    await ctx.db.patch(templateId, {
      usageCount: (template.usageCount || 0) + 1,
      lastUsed: Date.now(),
    });

    return { success: true };
  },
});

// Create new template
export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    difficulty: v.string(),
    estimatedDuration: v.number(),
    exercises: v.array(v.object({
      name: v.string(),
      category: v.string(),
      targetSets: v.number(),
      targetReps: v.string(),
      targetWeight: v.optional(v.number()),
      restTime: v.number(),
      notes: v.optional(v.string()),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    // Check user's template limit based on subscription
    const existingTemplates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .collect();

    const templateLimit = user.subscriptionTier === "free" ? 3 : Infinity;
    if (existingTemplates.length >= templateLimit) {
      throw new Error(`Template limit reached. Upgrade to Premium for unlimited templates.`);
    }

    const templateId = await ctx.db.insert("workoutTemplates", {
      ...args,
      isPreBuilt: false,
      createdBy: user._id,
      usageCount: 0,
    });

    return templateId;
  },
});

// Update template
export const updateTemplate = mutation({
  args: {
    templateId: v.id("workoutTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    estimatedDuration: v.optional(v.number()),
    exercises: v.optional(v.array(v.object({
      name: v.string(),
      category: v.string(),
      targetSets: v.number(),
      targetReps: v.string(),
      targetWeight: v.optional(v.number()),
      restTime: v.number(),
      notes: v.optional(v.string()),
      order: v.number(),
    }))),
  },
  handler: async (ctx, { templateId, ...updates }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");

    // Verify user owns the template
    if (template.createdBy !== user._id) {
      throw new Error("Not authorized to update this template");
    }

    await ctx.db.patch(templateId, updates);
    return templateId;
  },
});

// Delete template
export const deleteTemplate = mutation({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, { templateId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");

    // Verify user owns the template
    if (template.createdBy !== user._id) {
      throw new Error("Not authorized to delete this template");
    }

    await ctx.db.delete(templateId);
    return { success: true };
  },
});

// Get template usage statistics
export const getTemplateStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { totalTemplates: 0, totalUsage: 0 };

    const templates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .collect();

    const totalUsage = templates.reduce((sum, template) => sum + (template.usageCount || 0), 0);

    return {
      totalTemplates: templates.length,
      totalUsage,
    };
  },
});

// Log a template (add all exercises from template to recent workouts)
export const logTemplate = mutation({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, { templateId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not authenticated");

    // Get the template
    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");

    // Verify user owns the template
    if (template.createdBy !== user._id) {
      throw new Error("Not authorized to log this template");
    }

    // Log all exercises from the template as recent workouts
    const currentTime = Date.now();
    const exercisesAdded = [];

    for (const templateExercise of template.exercises) {
      console.log(`Template exercise: ${templateExercise.name}, targetWeight: ${templateExercise.targetWeight}`);
      
      const exerciseData = {
        userId: user._id,
        name: templateExercise.name,
        category: templateExercise.category,
        setsData: Array(templateExercise.targetSets).fill(null).map(() => ({
          reps: parseInt(templateExercise.targetReps.split('-')[0]) || 1, // Use lower bound of rep range
          weight: templateExercise.targetWeight !== undefined ? templateExercise.targetWeight : undefined,
          notes: templateExercise.notes || undefined,
        })),
        notes: templateExercise.notes,
        performedAt: currentTime,
      };
      
      console.log(`Created exercise data:`, exerciseData);

      const exerciseId = await ctx.db.insert("exercises", exerciseData);
      exercisesAdded.push({
        id: exerciseId,
        name: templateExercise.name,
        sets: templateExercise.targetSets,
      });
    }

    // Update template usage tracking
    await ctx.db.patch(templateId, {
      usageCount: (template.usageCount || 0) + 1,
      lastUsed: currentTime,
    });

    return {
      message: `Logged ${exercisesAdded.length} exercises from template "${template.name}"`,
      exercisesAdded,
    };
  },
});