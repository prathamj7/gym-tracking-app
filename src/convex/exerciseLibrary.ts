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

// Seed some default exercises if table is empty OR add any missing ones by name.
export const seedDefault = mutation({
  args: {},
  handler: async (ctx) => {
    // Expanded list: ~20+ curated exercises with imagery
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
      {
        name: "Pull-Up",
        category: "Strength",
        primaryMuscle: "Back",
        difficulty: "Intermediate",
        equipment: "Bodyweight",
        description: "Pull your body upward until chin passes the bar.",
        tips: "Engage lats first; keep core tight; avoid swinging.",
        commonMistakes: "Partial range; using momentum; flared ribs.",
        mediaUrl: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?q=80&w=800&auto=format&fit=crop",
        popularity: 92,
      },
      {
        name: "Bent-Over Row (Barbell)",
        category: "Strength",
        primaryMuscle: "Back",
        difficulty: "Intermediate",
        equipment: "Barbell",
        description: "Hinge and row the barbell towards your lower ribs.",
        tips: "Neutral spine; pull with elbows; keep bar close.",
        commonMistakes: "Rounding back; shrugging; bouncing reps.",
        mediaUrl: "https://images.unsplash.com/photo-1571731956672-dd5c3e1965b6?q=80&w=800&auto=format&fit=crop",
        popularity: 89,
      },
      {
        name: "Incline Dumbbell Press",
        category: "Strength",
        primaryMuscle: "Chest",
        difficulty: "Intermediate",
        equipment: "Dumbbell",
        description: "Press dumbbells from an incline bench to target upper chest.",
        tips: "Keep wrists neutral; control tempo; don't flare elbows.",
        commonMistakes: "Too steep angle; bouncing weights.",
        mediaUrl: "https://images.unsplash.com/photo-1517438322307-e67111335449?q=80&w=800&auto=format&fit=crop",
        popularity: 87,
      },
      {
        name: "Romanian Deadlift",
        category: "Strength",
        primaryMuscle: "Hamstrings",
        difficulty: "Intermediate",
        equipment: "Barbell",
        description: "Hinge pattern focusing on hamstrings with slight knee bend.",
        tips: "Push hips back; keep bar close; neutral spine.",
        commonMistakes: "Squatting the RDL; rounding shoulders.",
        mediaUrl: "https://images.unsplash.com/photo-1594737625785-c6683fc284d2?q=80&w=800&auto=format&fit=crop",
        popularity: 86,
      },
      {
        name: "Walking Lunges",
        category: "Strength",
        primaryMuscle: "Legs",
        difficulty: "Beginner",
        equipment: "Dumbbell",
        description: "Alternate lunges while moving forward.",
        tips: "Keep torso tall; push through front heel; balance.",
        commonMistakes: "Knee collapsing in; short strides.",
        mediaUrl: "https://images.unsplash.com/photo-1540497077202-7c8a68a2d3f1?q=80&w=800&auto=format&fit=crop",
        popularity: 84,
      },
      {
        name: "Leg Press",
        category: "Strength",
        primaryMuscle: "Legs",
        difficulty: "Beginner",
        equipment: "Machine",
        description: "Press the platform away by extending your knees and hips.",
        tips: "Do not lock knees; full range with control.",
        commonMistakes: "Too much weight; short ROM.",
        mediaUrl: "https://images.unsplash.com/photo-1571731956672-5a4b2e4b24af?q=80&w=800&auto=format&fit=crop",
        popularity: 83,
      },
      {
        name: "Cable Row (Seated)",
        category: "Strength",
        primaryMuscle: "Back",
        difficulty: "Beginner",
        equipment: "Machine",
        description: "Row the cable handle toward the torso with a neutral spine.",
        tips: "Pull elbows back; squeeze shoulder blades.",
        commonMistakes: "Leaning back excessively; jerky reps.",
        mediaUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa0d3d9b?q=80&w=800&auto=format&fit=crop",
        popularity: 82,
      },
      {
        name: "Lat Pulldown",
        category: "Strength",
        primaryMuscle: "Back",
        difficulty: "Beginner",
        equipment: "Machine",
        description: "Pull bar down toward upper chest focusing on lats.",
        tips: "Lead with elbows; avoid shrugging.",
        commonMistakes: "Pulling behind neck; swinging.",
        mediaUrl: "https://images.unsplash.com/photo-1594737625785-5e1b8d5d79b4?q=80&w=800&auto=format&fit=crop",
        popularity: 88,
      },
      {
        name: "Biceps Curl (Dumbbell)",
        category: "Strength",
        primaryMuscle: "Arms",
        difficulty: "Beginner",
        equipment: "Dumbbell",
        description: "Curl dumbbells while keeping elbows pinned to sides.",
        tips: "Control the eccentric; avoid shoulder sway.",
        commonMistakes: "Using momentum; half reps.",
        mediaUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop",
        popularity: 80,
      },
      {
        name: "Triceps Pushdown",
        category: "Strength",
        primaryMuscle: "Arms",
        difficulty: "Beginner",
        equipment: "Machine",
        description: "Extend elbows down using cable attachment.",
        tips: "Keep elbows tight; full lockout with control.",
        commonMistakes: "Flaring elbows; shrugging shoulders.",
        mediaUrl: "https://images.unsplash.com/photo-1612361907338-45b3a0e327c9?q=80&w=800&auto=format&fit=crop",
        popularity: 79,
      },
      {
        name: "Kettlebell Swing",
        category: "Cardio",
        primaryMuscle: "Glutes",
        difficulty: "Intermediate",
        equipment: "Kettlebell",
        description: "Explosive hip hinge swinging kettlebell to shoulder height.",
        tips: "Hinge not squat; snap hips; neutral spine.",
        commonMistakes: "Lifting with arms; rounding back.",
        mediaUrl: "https://images.unsplash.com/photo-1594385208978-9e3dbe7f2a9d?q=80&w=800&auto=format&fit=crop",
        popularity: 90,
      },
      {
        name: "Cycling (Stationary)",
        category: "Cardio",
        primaryMuscle: "Legs",
        difficulty: "Beginner",
        equipment: "Machine",
        description: "Low-impact cardio on a stationary bike.",
        tips: "Adjust seat height; maintain cadence; hydrate.",
        commonMistakes: "Too much resistance; poor posture.",
        mediaUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
        popularity: 85,
      },
      {
        name: "Rowing Machine",
        category: "Cardio",
        primaryMuscle: "Back",
        difficulty: "Beginner",
        equipment: "Machine",
        description: "Full-body cardio using a rowing ergometer.",
        tips: "Leg drive first; then lean; then pull.",
        commonMistakes: "Early arm pull; rounding back.",
        mediaUrl: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=800&auto=format&fit=crop",
        popularity: 86,
      },
      {
        name: "Hip Thrust (Barbell)",
        category: "Strength",
        primaryMuscle: "Glutes",
        difficulty: "Intermediate",
        equipment: "Barbell",
        description: "Raise hips by squeezing glutes with a barbell over hips.",
        tips: "Chin tucked; full lockout; control descent.",
        commonMistakes: "Over-arching back; bouncing.",
        mediaUrl: "https://images.unsplash.com/photo-1604480132736-9483c8f0e77e?q=80&w=800&auto=format&fit=crop",
        popularity: 88,
      },
      {
        name: "Calf Raise",
        category: "Strength",
        primaryMuscle: "Calves",
        difficulty: "Beginner",
        equipment: "Machine",
        description: "Raise heels to contract calves standing or seated.",
        tips: "Pause at top; full stretch at bottom.",
        commonMistakes: "Bouncing; short range.",
        mediaUrl: "https://images.unsplash.com/photo-1583454110551-9dfb1b5c1a3b?q=80&w=800&auto=format&fit=crop",
        popularity: 75,
      },
      {
        name: "Russian Twist",
        category: "Core",
        primaryMuscle: "Obliques",
        difficulty: "Beginner",
        equipment: "None",
        description: "Seated torso rotations to engage obliques; add weight to progress.",
        tips: "Keep chest up; move from torso not arms.",
        commonMistakes: "Rounding back; moving too fast.",
        mediaUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=800&auto=format&fit=crop",
        popularity: 78,
      },
      {
        name: "Hanging Leg Raise",
        category: "Core",
        primaryMuscle: "Core",
        difficulty: "Intermediate",
        equipment: "Bodyweight",
        description: "Raise legs while hanging to target lower abs.",
        tips: "Posterior pelvic tilt; no swinging.",
        commonMistakes: "Using momentum; arching back.",
        mediaUrl: "https://images.unsplash.com/photo-1594737625785-1bb0c5bb2f63?q=80&w=800&auto=format&fit=crop",
        popularity: 82,
      },
      {
        name: "Face Pull",
        category: "Strength",
        primaryMuscle: "Rear Delts",
        difficulty: "Beginner",
        equipment: "Machine",
        description: "Pull rope attachment toward face, externally rotating shoulders.",
        tips: "High elbows; squeeze rear delts.",
        commonMistakes: "Too heavy; shrugging.",
        mediaUrl: "https://images.unsplash.com/photo-1583454110551-6d1cbe6a27f2?q=80&w=800&auto=format&fit=crop",
        popularity: 81,
      },
      {
        name: "Goblet Squat",
        category: "Strength",
        primaryMuscle: "Legs",
        difficulty: "Beginner",
        equipment: "Dumbbell",
        description: "Hold a dumbbell at chest and perform a squat.",
        tips: "Elbows inside knees; keep chest tall.",
        commonMistakes: "Heels raising; collapsing knees.",
        mediaUrl: "https://images.unsplash.com/photo-1601933470928-c1f3a5a9c823?q=80&w=800&auto=format&fit=crop",
        popularity: 84,
      },
      {
        name: "Seated Hamstring Curl",
        category: "Strength",
        primaryMuscle: "Hamstrings",
        difficulty: "Beginner",
        equipment: "Machine",
        description: "Flex knees against machine resistance.",
        tips: "Control both directions; full ROM.",
        commonMistakes: "Too heavy; bouncing.",
        mediaUrl: "https://images.unsplash.com/photo-1571731956672-3f2f76d85ee8?q=80&w=800&auto=format&fit=crop",
        popularity: 77,
      },
    ];

    let inserted = 0;
    for (const it of items) {
      const existing = await ctx.db
        .query("exerciseLibrary")
        .withIndex("by_nameLower", (ix) => ix.eq("nameLower", it.name.toLowerCase()))
        .unique();

      if (!existing) {
        await ctx.db.insert("exerciseLibrary", {
          ...it,
          nameLower: it.name.toLowerCase(),
        });
        inserted += 1;
      }
    }
    return inserted === 0 ? "already-up-to-date" : `inserted-${inserted}`;
  },
});