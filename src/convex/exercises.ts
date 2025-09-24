import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    // Legacy fields for backward compatibility
    sets: v.optional(v.number()),
    reps: v.optional(v.number()),
    weight: v.optional(v.number()),
    // New field: array of sets with individual values
    setsData: v.optional(v.array(v.object({
      reps: v.number(),
      weight: v.optional(v.number()),
      notes: v.optional(v.string()),
    }))),
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

    const performedAt = args.performedAt ?? Date.now();
    const performedDate = new Date(performedAt);
    
    // Create date boundaries for same-day check (start and end of day)
    const dayStart = new Date(performedDate.getFullYear(), performedDate.getMonth(), performedDate.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;

    // Check if there's already an entry for this exercise on the same day
    const existingEntry = await ctx.db
      .query("exercises")
      .withIndex("by_user_and_name_and_performedAt", (q) =>
        q.eq("userId", user._id).eq("name", args.name)
      )
      .filter((q) => 
        q.and(
          q.gte(q.field("performedAt"), dayStart),
          q.lte(q.field("performedAt"), dayEnd)
        )
      )
      .first();

    let insertedId: any;
    let isNewEntry = false;

    if (existingEntry && args.setsData) {
      // Merge with existing entry - append new sets to existing setsData
      const currentSetsData = existingEntry.setsData || [];
      const updatedSetsData = [...currentSetsData, ...args.setsData];
      
      await ctx.db.patch(existingEntry._id, {
        setsData: updatedSetsData,
        notes: args.notes ? 
          (existingEntry.notes ? `${existingEntry.notes}\n${args.notes}` : args.notes) :
          existingEntry.notes,
      });
      
      insertedId = existingEntry._id;
    } else {
      // Create new entry
      insertedId = await ctx.db.insert("exercises", {
        ...args,
        userId: user._id,
        performedAt,
      });
      isNewEntry = true;
    }

    // Determine if this entry is a new PR for this exercise
    let isNewPR = false as boolean;
    let dimension: "weight" | "duration" | null = null;

    // For PR calculation, we'll determine based on the args provided
    // Calculate max weight from current entry
    let currentMaxWeight = -Infinity;
    if (args.setsData && args.setsData.length > 0) {
      // New format: check max weight across all sets
      currentMaxWeight = args.setsData.reduce((max: number, set) => 
        set.weight && set.weight > max ? set.weight : max, -Infinity);
    } else if (typeof args.weight === "number") {
      // Legacy format
      currentMaxWeight = args.weight;
    }

    // Fetch previous entries for the same exercise name (excluding any potential update to existing entry)
    const sameName = await ctx.db
      .query("exercises")
      .withIndex("by_user_and_name_and_performedAt", (q) =>
        q.eq("userId", user._id).eq("name", args.name),
      )
      .filter((q) => q.neq(q.field("_id"), insertedId))
      .collect();

    // Calculate best previous weight
    const prevWeightMax = sameName
      .reduce((max, e) => {
        let exerciseMaxWeight = -Infinity;
        if (e.setsData && e.setsData.length > 0) {
          exerciseMaxWeight = e.setsData.reduce((setMax: number, set) => 
            set.weight && set.weight > setMax ? set.weight : setMax, -Infinity);
        } else if (typeof e.weight === "number") {
          exerciseMaxWeight = e.weight;
        }
        return exerciseMaxWeight > max ? exerciseMaxWeight : max;
      }, -Infinity);

    // Check for weight PR
    if (currentMaxWeight !== -Infinity) {
      dimension = "weight";
      if (currentMaxWeight > (prevWeightMax === -Infinity ? -Infinity : prevWeightMax)) {
        isNewPR = true;
      }
    }
    
    // Check for duration PR (for cardio exercises)
    if (typeof args.duration === "number") {
      const prevDurationMax = sameName
        .filter((e) => typeof e.duration === "number")
        .reduce((max, e) => (e.duration! > max ? e.duration! : max), -Infinity);
      
      if (!dimension) { // Only set if no weight dimension already set
        dimension = "duration";
        if (args.duration > (prevDurationMax === -Infinity ? -Infinity : prevDurationMax)) {
          isNewPR = true;
        }
      }
    }

    // Return info so the client can toast a PR notification
    return { id: insertedId, isNewPR, dimension, isNewEntry };
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

// Add getAll function that components are expecting
export const getAll = query({
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
    // Legacy fields for backward compatibility
    sets: v.optional(v.number()),
    reps: v.optional(v.number()),
    weight: v.optional(v.number()),
    // New field: array of sets with individual values
    setsData: v.optional(v.array(v.object({
      reps: v.number(),
      weight: v.optional(v.number()),
      notes: v.optional(v.string()),
    }))),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    // Allow updating the performedAt date
    performedAt: v.optional(v.number()),
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

    // Sorting - handle missing sets/reps safely
    const sorted = [...filtered].sort((a, b) => {
      switch (args.sortBy) {
        case "weight": {
          // Use weight x reps consistently (handle undefined safely)
          const aw = (a.weight || 0) * (a.reps || 0);
          const bw = (b.weight || 0) * (b.reps || 0);
          return bw - aw;
        }
        case "sets":
          return (b.sets || 0) - (a.sets || 0);
        case "reps":
          return (b.reps || 0) - (a.reps || 0);
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
    // Handle optional sets
    const totalWeight = exercises.reduce((sum, e) => sum + (e.weight || 0) * (e.sets || 0), 0);
    
    // Get recent workouts (last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentWorkouts = exercises.filter(e => e._creationTime > weekAgo).length;

    // Add: Streak calculations
    const msPerDay = 24 * 60 * 60 * 1000;
    const toLocalDayIndex = (ts: number) => {
      const d = new Date(ts);
      const localStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      return Math.floor(localStart / msPerDay);
    };

    const dayIndicesSet = new Set<number>(
      exercises.map(e => toLocalDayIndex(e.performedAt)),
    );

    // Current streak: consecutive days ending today
    const today = new Date();
    const todayIndex = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / msPerDay);
    let currentStreak = 0;
    if (dayIndicesSet.has(todayIndex)) {
      let idx = todayIndex;
      while (dayIndicesSet.has(idx)) {
        currentStreak++;
        idx -= 1;
      }
    } else {
      currentStreak = 0;
    }

    // Longest streak: max run anywhere
    const sortedIndices = Array.from(dayIndicesSet).sort((a, b) => a - b);
    let longestStreak = 0;
    let run = 0;
    let prev: number | null = null;
    for (const idx of sortedIndices) {
      if (prev === null || idx !== prev + 1) {
        run = 1;
      } else {
        run += 1;
      }
      longestStreak = Math.max(longestStreak, run);
      prev = idx;
    }

    return {
      totalWorkouts,
      categoriesCount: categories.length,
      totalWeight,
      recentWorkouts,
      categories,
      // Added: streaks
      currentStreak,
      longestStreak,
    };
  },
});

// List all exercises done on a specific calendar date (local time window) for current user
export const listByDate = query({
  // Make 'date' optional to avoid validation errors if called without args
  args: { date: v.optional(v.number()) }, // ms timestamp for any time on the selected date
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    // If date not provided, return empty list (no-op)
    if (args.date === undefined || args.date === null) {
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
  // Make 'name' optional to avoid validation errors if called without args
  args: { name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    // If no name provided, return empty list (no-op)
    if (!args.name) {
      return [];
    }

    const rows = await ctx.db
      .query("exercises")
      .withIndex("by_user_and_name_and_performedAt", (q) =>
        q.eq("userId", user._id).eq("name", args.name!),
      )
      .order("asc")
      .collect();

    return rows;
  },
});

// Added: getPRs query to compute personal records per exercise
export const getPRs = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    // Load all exercises for user
    const rows = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Group by name and compute PRs
    const byName = new Map<string, typeof rows>();

    for (const r of rows) {
      const arr = byName.get(r.name) ?? [];
      arr.push(r);
      byName.set(r.name, arr);
    }

    const results = Array.from(byName.entries()).map(([name, entries]) => {
      // Best weight entry
      let bestWeightVal = -Infinity;
      let bestWeightEntry: any = null;

      // Best duration entry
      let bestDurationVal = -Infinity;
      let bestDurationEntry: any = null;

      for (const e of entries) {
        if (typeof e.weight === "number" && e.weight > bestWeightVal) {
          bestWeightVal = e.weight;
          bestWeightEntry = e;
        }
        if (typeof e.duration === "number" && e.duration > bestDurationVal) {
          bestDurationVal = e.duration;
          bestDurationEntry = e;
        }
      }

      // Prefer weight-based PR if available, otherwise duration-based
      if (bestWeightEntry) {
        return {
          name,
          type: "weight" as const,
          value: bestWeightEntry.weight as number,
          reps: bestWeightEntry.reps as number,
          unit: "kg" as const,
          performedAt: bestWeightEntry.performedAt as number,
        };
      } else if (bestDurationEntry) {
        return {
          name,
          type: "duration" as const,
          value: bestDurationEntry.duration as number,
          reps: null as number | null,
          unit: "min" as const,
          performedAt: bestDurationEntry.performedAt as number,
        };
      } else {
        // No measurable PR
        return {
          name,
          type: "none" as const,
          value: 0,
          reps: null as number | null,
          unit: "" as const,
          performedAt: 0,
        };
      }
    });

    // Filter out 'none' types
    return results
      .filter((r) => r.type !== "none")
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});