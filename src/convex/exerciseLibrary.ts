import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List exercises with optional search and filters.
// Note: To keep indexes efficient, we only use one index per request.
// If multiple filters are provided, we pick the highest priority:
// search > category > difficulty > equipment, then client can further filter if needed.
export const list = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    equipment: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200);
    const results: any[] = [];

    // Prefix search helper using nameLower
    const prefixRange = (prefix: string) => {
      const start = prefix;
      // Compute an end string that is the next possible string after the prefix
      const lastCharCode = prefix.charCodeAt(prefix.length - 1);
      const end =
        prefix.slice(0, -1) + String.fromCharCode(lastCharCode + 1);
      return { start, end };
    };

    if (args.search && args.search.trim()) {
      const p = args.search.trim().toLowerCase();
      const { start, end } = prefixRange(p);
      const q = ctx.db
        .query("exerciseLibrary")
        .withIndex("by_nameLower", (ix) => ix.gte("nameLower", start).lt("nameLower", end))
        .order("asc");
      for await (const row of q) {
        results.push(row);
        if (results.length >= limit) break;
      }
      return results;
    }

    if (args.category) {
      const q = ctx.db
        .query("exerciseLibrary")
        .withIndex("by_category", (ix) => ix.eq("category", args.category!))
        .order("asc");
      for await (const row of q) {
        results.push(row);
        if (results.length >= limit) break;
      }
      return results;
    }

    if (args.difficulty) {
      const q = ctx.db
        .query("exerciseLibrary")
        .withIndex("by_difficulty", (ix) => ix.eq("difficulty", args.difficulty!))
        .order("asc");
      for await (const row of q) {
        results.push(row);
        if (results.length >= limit) break;
      }
      return results;
    }

    if (args.equipment) {
      const q = ctx.db
        .query("exerciseLibrary")
        .withIndex("by_equipment", (ix) => ix.eq("equipment", args.equipment!))
        .order("asc");
      for await (const row of q) {
        results.push(row);
        if (results.length >= limit) break;
      }
      return results;
    }

    // Default: alphabetical by nameLower
    const q = ctx.db
      .query("exerciseLibrary")
      .withIndex("by_nameLower")
      .order("asc");
    for await (const row of q) {
      results.push(row);
      if (results.length >= limit) break;
    }
    return results;
  },
});

// Seed some default exercises if table is empty.
export const seedDefault = mutation({
  args: {},
  handler: async (ctx) => {
    const anyOne = await ctx.db.query("exerciseLibrary").withIndex("by_nameLower").take(1);
    if (anyOne.length > 0) return "already-seeded";

    const items = [
      {
        name: "Barbell Bench Press",
        category: "Strength",
        primaryMuscle: "Chest",
        difficulty: "Intermediate",
        equipment: "Barbell",
        description: "Press a barbell from chest level while lying on a flat bench.",
        tips: "Keep your shoulder blades retracted and feet planted firmly.",
        commonMistakes: "Flaring elbows too much; bouncing the bar off the chest.",
        mediaUrl: "https://images.unsplash.com/photo-1517963628607-44f1ddc2d42e?q=80&w=800&auto=format&fit=crop",
        popularity: 95,
      },
      {
        name: "Back Squat",
        category: "Strength",
        primaryMuscle: "Legs",
        difficulty: "Intermediate",
        equipment: "Barbell",
        description: "Squat down with a barbell resting across your upper back.",
        tips: "Drive knees out; keep chest up; brace core.",
        commonMistakes: "Heels lifting; caving knees; rounding lower back.",
        mediaUrl: "https://images.unsplash.com/photo-1517130038641-a774d04afb3c?q=80&w=800&auto=format&fit=crop",
        popularity: 98,
      },
      {
        name: "Deadlift",
        category: "Strength",
        primaryMuscle: "Back",
        difficulty: "Advanced",
        equipment: "Barbell",
        description: "Lift a barbell from the ground to hip level and back down.",
        tips: "Hinge at the hips; keep bar close; neutral spine.",
        commonMistakes: "Rounding back; jerking the bar; not locking out hips.",
        mediaUrl: "https://images.unsplash.com/photo-1546484959-f9a53db89f10?q=80&w=800&auto=format&fit=crop",
        popularity: 99,
      },
      {
        name: "Plank",
        category: "Core",
        primaryMuscle: "Core",
        difficulty: "Beginner",
        equipment: "Bodyweight",
        description: "Hold a straight-body position supported by forearms and toes.",
        tips: "Squeeze glutes; keep a straight line from head to heels.",
        commonMistakes: "Sagging hips; craning the neck; holding breath.",
        mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
        popularity: 85,
      },
      {
        name: "Running",
        category: "Cardio",
        primaryMuscle: "Legs",
        difficulty: "Beginner",
        equipment: "None",
        description: "Continuous forward movement at a pace faster than walking.",
        tips: "Maintain cadence; relax shoulders; land softly.",
        commonMistakes: "Overstriding; clenched fists; poor pacing.",
        mediaUrl: "https://images.unsplash.com/photo-1518617840859-acd542e13d48?q=80&w=800&auto=format&fit=crop",
        popularity: 90,
      },
      {
        name: "Shoulder Press (Dumbbell)",
        category: "Strength",
        primaryMuscle: "Shoulders",
        difficulty: "Beginner",
        equipment: "Dumbbell",
        description: "Press dumbbells overhead from shoulder height.",
        tips: "Brace core; avoid arching lower back; control the descent.",
        commonMistakes: "Elbows flaring excessively; using momentum.",
        mediaUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop",
        popularity: 88,
      },
    ];

    for (const it of items) {
      await ctx.db.insert("exerciseLibrary", {
        ...it,
        nameLower: it.name.toLowerCase(),
      });
    }
    return "seeded";
  },
});
