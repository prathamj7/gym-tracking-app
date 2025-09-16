import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    sets: v.number(),
    reps: v.number(),
    weight: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("exercises", {
      ...args,
      userId: user._id,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("exercises"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    sets: v.optional(v.number()),
    reps: v.optional(v.number()),
    weight: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;
    const exercise = await ctx.db.get(id);
    
    if (!exercise || exercise.userId !== user._id) {
      throw new Error("Exercise not found or unauthorized");
    }

    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: {
    id: v.id("exercises"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const exercise = await ctx.db.get(args.id);
    
    if (!exercise || exercise.userId !== user._id) {
      throw new Error("Exercise not found or unauthorized");
    }

    return await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalWorkouts = exercises.length;
    const categories = [...new Set(exercises.map(e => e.category))];
    const totalWeight = exercises.reduce((sum, e) => sum + (e.weight || 0) * e.sets, 0);
    
    // Get recent workouts (last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentWorkouts = exercises.filter(e => e._creationTime > weekAgo).length;

    return {
      totalWorkouts,
      categoriesCount: categories.length,
      totalWeight,
      recentWorkouts,
      categories,
    };
  },
});
