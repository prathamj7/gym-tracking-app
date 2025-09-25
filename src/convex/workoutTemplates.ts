/**
 * Workout Templates - Convex Backend Functions
 * 
 * This file handles all server-side operations for workout templates including:
 * - CRUD operations for templates
 * - Pre-built template seeding
 * - Template usage tracking
 * - User template management with limits
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

// Get all templates (pre-built + user's personal templates)
export const getAllTemplates = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get pre-built templates
    const preBuiltTemplates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_prebuilt", (q) => q.eq("isPreBuilt", true))
      .collect();

    // Get user's personal templates
    const userTemplates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .collect();

    return [...preBuiltTemplates, ...userTemplates];
  },
});

// Get templates by category
export const getTemplatesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // Get pre-built templates in category
    const preBuiltTemplates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isPreBuilt"), true))
      .collect();

    // Get user's templates in category
    const userTemplates = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user_and_category", (q) => 
        q.eq("createdBy", user._id).eq("category", args.category)
      )
      .collect();

    return [...preBuiltTemplates, ...userTemplates];
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
      .order("desc")
      .collect();
  },
});

// Get a specific template by ID
export const getTemplate = query({
  args: { id: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) return null;

    // If it's a pre-built template, anyone can access
    if (template.isPreBuilt) return template;

    // If it's a user template, only the creator can access
    const user = await getCurrentUser(ctx);
    if (!user || template.createdBy !== user._id) return null;

    return template;
  },
});

// Create a new template
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
    if (!user) throw new Error("Not authenticated");

    // Check user template limit (free users: 3 templates)
    const userTemplateCount = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .collect()
      .then(templates => templates.length);

    // Check if user is premium (simplified check - you can enhance this)
    const isPremium = user.subscriptionTier === "premium" || user.subscriptionTier === "pro";
    
    if (!isPremium && userTemplateCount >= 3) {
      throw new Error("Free users can create up to 3 templates. Upgrade to Premium for unlimited templates.");
    }

    const templateId = await ctx.db.insert("workoutTemplates", {
      name: args.name.trim(),
      description: args.description?.trim(),
      category: args.category,
      difficulty: args.difficulty,
      estimatedDuration: args.estimatedDuration,
      exercises: args.exercises,
      isPreBuilt: false,
      createdBy: user._id,
      usageCount: 0,
    });

    return templateId;
  },
});

// Update an existing template
export const updateTemplate = mutation({
  args: {
    id: v.id("workoutTemplates"),
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
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.id);
    if (!template) throw new Error("Template not found");

    // Only allow editing user's own templates
    if (template.createdBy !== user._id) {
      throw new Error("You can only edit your own templates");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.description !== undefined) updates.description = args.description?.trim();
    if (args.category !== undefined) updates.category = args.category;
    if (args.difficulty !== undefined) updates.difficulty = args.difficulty;
    if (args.estimatedDuration !== undefined) updates.estimatedDuration = args.estimatedDuration;
    if (args.exercises !== undefined) updates.exercises = args.exercises;

    await ctx.db.patch(args.id, updates);
    return { success: true };
  },
});

// Delete a template
export const deleteTemplate = mutation({
  args: { id: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.id);
    if (!template) throw new Error("Template not found");

    // Only allow deleting user's own templates
    if (template.createdBy !== user._id) {
      throw new Error("You can only delete your own templates");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Track template usage (when user starts a workout from template)
export const trackTemplateUsage = mutation({
  args: { templateId: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    // Update usage tracking
    await ctx.db.patch(args.templateId, {
      lastUsed: Date.now(),
      usageCount: (template.usageCount || 0) + 1,
    });

    return { success: true };
  },
});

// Get user's template count (for premium limit checking)
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

// Seed pre-built templates (run once to populate database)
export const seedPreBuiltTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if pre-built templates already exist
    const existing = await ctx.db
      .query("workoutTemplates")
      .withIndex("by_prebuilt", (q) => q.eq("isPreBuilt", true))
      .first();

    if (existing) {
      return { message: "Pre-built templates already exist" };
    }

    // Pre-built templates data
    const templates = [
      {
        name: "PPL: Push Day",
        description: "Chest, shoulders, and triceps focused workout",
        category: "Push/Pull/Legs",
        difficulty: "Intermediate",
        estimatedDuration: 75,
        exercises: [
          { name: "Barbell Bench Press", category: "Chest", targetSets: 4, targetReps: "6-8", restTime: 180, order: 1 },
          { name: "Incline Dumbbell Press", category: "Chest", targetSets: 3, targetReps: "8-10", restTime: 120, order: 2 },
          { name: "Overhead Press", category: "Shoulders", targetSets: 3, targetReps: "6-8", restTime: 150, order: 3 },
          { name: "Lateral Raises", category: "Shoulders", targetSets: 3, targetReps: "12-15", restTime: 90, order: 4 },
          { name: "Dips", category: "Triceps", targetSets: 3, targetReps: "8-12", restTime: 120, order: 5 },
          { name: "Tricep Pushdowns", category: "Triceps", targetSets: 3, targetReps: "10-12", restTime: 90, order: 6 },
        ]
      },
      {
        name: "PPL: Pull Day", 
        description: "Back and biceps focused workout",
        category: "Push/Pull/Legs",
        difficulty: "Intermediate",
        estimatedDuration: 70,
        exercises: [
          { name: "Deadlifts", category: "Back", targetSets: 3, targetReps: "5-6", restTime: 240, order: 1 },
          { name: "Pull-ups", category: "Back", targetSets: 3, targetReps: "6-10", restTime: 150, order: 2 },
          { name: "Barbell Rows", category: "Back", targetSets: 3, targetReps: "8-10", restTime: 120, order: 3 },
          { name: "Cable Rows", category: "Back", targetSets: 3, targetReps: "10-12", restTime: 90, order: 4 },
          { name: "Barbell Curls", category: "Biceps", targetSets: 3, targetReps: "8-10", restTime: 90, order: 5 },
          { name: "Hammer Curls", category: "Biceps", targetSets: 3, targetReps: "10-12", restTime: 90, order: 6 },
        ]
      },
      {
        name: "PPL: Leg Day",
        description: "Complete lower body workout",
        category: "Push/Pull/Legs", 
        difficulty: "Intermediate",
        estimatedDuration: 80,
        exercises: [
          { name: "Squats", category: "Legs", targetSets: 4, targetReps: "6-8", restTime: 240, order: 1 },
          { name: "Romanian Deadlifts", category: "Legs", targetSets: 3, targetReps: "8-10", restTime: 180, order: 2 },
          { name: "Bulgarian Split Squats", category: "Legs", targetSets: 3, targetReps: "10-12", restTime: 120, order: 3 },
          { name: "Leg Curls", category: "Legs", targetSets: 3, targetReps: "12-15", restTime: 90, order: 4 },
          { name: "Calf Raises", category: "Legs", targetSets: 4, targetReps: "15-20", restTime: 60, order: 5 },
        ]
      },
      {
        name: "Full Body Beginner",
        description: "Perfect starter routine hitting all major muscle groups",
        category: "Full Body",
        difficulty: "Beginner", 
        estimatedDuration: 45,
        exercises: [
          { name: "Squats", category: "Legs", targetSets: 3, targetReps: "8-10", restTime: 120, order: 1 },
          { name: "Push-ups", category: "Chest", targetSets: 3, targetReps: "8-12", restTime: 90, order: 2 },
          { name: "Bent-over Rows", category: "Back", targetSets: 3, targetReps: "8-10", restTime: 120, order: 3 },
          { name: "Overhead Press", category: "Shoulders", targetSets: 3, targetReps: "6-8", restTime: 120, order: 4 },
          { name: "Plank", category: "Core", targetSets: 3, targetReps: "30-60 sec", restTime: 60, order: 5 },
        ]
      },
      {
        name: "Upper Body Strength",
        description: "Focus on upper body compound movements",
        category: "Upper/Lower",
        difficulty: "Intermediate",
        estimatedDuration: 60,
        exercises: [
          { name: "Barbell Bench Press", category: "Chest", targetSets: 4, targetReps: "5-6", restTime: 180, order: 1 },
          { name: "Pull-ups", category: "Back", targetSets: 4, targetReps: "6-8", restTime: 150, order: 2 },
          { name: "Overhead Press", category: "Shoulders", targetSets: 3, targetReps: "6-8", restTime: 150, order: 3 },
          { name: "Barbell Rows", category: "Back", targetSets: 3, targetReps: "8-10", restTime: 120, order: 4 },
          { name: "Dips", category: "Triceps", targetSets: 3, targetReps: "8-12", restTime: 120, order: 5 },
        ]
      },
      {
        name: "Quick 30-Min Power",
        description: "High-intensity workout for busy days",
        category: "Quick Workout",
        difficulty: "Intermediate",
        estimatedDuration: 30,
        exercises: [
          { name: "Squats", category: "Legs", targetSets: 3, targetReps: "10-12", restTime: 60, order: 1 },
          { name: "Push-ups", category: "Chest", targetSets: 3, targetReps: "10-15", restTime: 45, order: 2 },
          { name: "Pull-ups", category: "Back", targetSets: 3, targetReps: "6-10", restTime: 60, order: 3 },
          { name: "Burpees", category: "Full Body", targetSets: 3, targetReps: "8-10", restTime: 60, order: 4 },
        ]
      }
    ];

    // Insert all templates
    for (const template of templates) {
      await ctx.db.insert("workoutTemplates", {
        ...template,
        isPreBuilt: true,
        usageCount: 0,
      });
    }

    return { message: `Created ${templates.length} pre-built templates` };
  },
});