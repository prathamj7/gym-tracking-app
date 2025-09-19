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
    // Optional date from the client; if not provided, default to now
    performedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("exercises", {
      ...args,
      userId: user._id,
      performedAt: args.performedAt ?? Date.now(),
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

export const listFiltered = query({
  args: {
    category: v.union(v.string(), v.null()),
    startDate: v.union(v.number(), v.null()),
    endDate: v.union(v.number(), v.null()),
    sortBy: v.union(
      v.literal("date"),
      v.literal("weight"),
      v.literal("sets"),
      v.literal("reps"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    // Base query: if category provided, use composite index; otherwise by_user
    let rows;
    if (args.category) {
      rows = await ctx.db
        .query("exercises")
        .withIndex("by_user_and_category", (q) =>
          q.eq("userId", user._id).eq("category", args.category!),
        )
        .collect();
    } else {
      rows = await ctx.db
        .query("exercises")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    }

    // Date filtering (range on performedAt)
    const filtered = rows.filter((e) => {
      const afterStart = args.startDate ? e.performedAt >= args.startDate : true;
      const beforeEnd = args.endDate ? e.performedAt <= args.endDate : true;
      return afterStart && beforeEnd;
    });

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (args.sortBy) {
        case "weight": {
          const aw = (a.weight || 0) * a.sets;
          const bw = (b.weight || 0) * b.sets;
          return bw - aw;
        }
        case "sets":
          return b.sets - a.sets;
        case "reps":
          return b.reps - a.reps;
        case "date":
        default:
          return b.performedAt - a.performedAt;
      }
    });

    return sorted;
  },
});

// List unique exercise names for the current user (for compare UI)
export const listNames = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    const rows = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const names = Array.from(new Set(rows.map((r) => r.name))).sort((a, b) =>
      a.localeCompare(b),
    );
    return names;
  },
});

// Compare a single exercise by name for two specific dates (per day)
export const compareByNameAndDates = query({
  args: {
    name: v.optional(v.string()),
    date1: v.optional(v.number()),
    date2: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { first: null, second: null };
    }

    // If any argument is missing, return empty comparison instead of throwing
    if (!args.name || args.date1 === undefined || args.date2 === undefined) {
      return { first: null, second: null };
    }

    const startOfDay = (ts: number) => {
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };
    const endOfDay = (ts: number) => {
      const d = new Date(ts);
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    };

    const ranges = [
      { start: startOfDay(args.date1), end: endOfDay(args.date1) },
      { start: startOfDay(args.date2), end: endOfDay(args.date2) },
    ] as const;

    // Helper to load first match within the day using index
    const loadForRange = async (start: number, end: number) => {
      const results = await ctx.db
        .query("exercises")
        .withIndex("by_user_and_name_and_performedAt", (q) =>
          q
            .eq("userId", user._id)
            .eq("name", args.name!)
            .gte("performedAt", start)
            .lte("performedAt", end),
        )
        .order("desc")
        .collect();
      return results[0] ?? null;
    };

    const [first, second] = await Promise.all([
      loadForRange(ranges[0].start, ranges[0].end),
      loadForRange(ranges[1].start, ranges[1].end),
    ]);

    return { first, second };
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

// List all exercises done on a specific calendar date (local time window) for current user
export const listByDate = query({
  args: { date: v.number() }, // ms timestamp for any time on the selected date
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const startOfDay = (ts: number) => {
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };
    const endOfDay = (ts: number) => {
      const d = new Date(ts);
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    };

    const start = startOfDay(args.date);
    const end = endOfDay(args.date);

    const rows = await ctx.db
      .query("exercises")
      .withIndex("by_user_and_performedAt", (q) =>
        q.eq("userId", user._id).gte("performedAt", start).lte("performedAt", end),
      )
      .order("asc")
      .collect();

    return rows;
  },
});

// List all entries for a given exercise name for current user
export const listByExerciseName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const rows = await ctx.db
      .query("exercises")
      .withIndex("by_user_and_name_and_performedAt", (q) =>
        q.eq("userId", user._id).eq("name", args.name),
      )
      .order("asc")
      .collect();

    return rows;
  },
});