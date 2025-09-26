/**
 * Simple script to seed workout templates
 * Run this once to populate the database with pre-built templates
 */

// You can run this in the Convex dashboard or call it from the frontend
// This is the seed data that gets inserted by the seedPreBuiltTemplates function

console.log("Workout Templates Seed Data:");
console.log("===========================");

// Now includes 16 comprehensive pre-built templates organized by muscle groups:

const templateCategories = {
  "Body Part Split": [
    "Chest Domination - Complete chest development",
    "Back Builder - Comprehensive back workout", 
    "Leg Crusher - Intense lower body workout",
    "Shoulder Sculptor - Complete shoulder development",
    "Arm Annihilator - Biceps and triceps focused",
    "Core Crusher - Comprehensive core strengthening"
  ],
  "Push/Pull/Legs": [
    "PPL: Push Day - Chest, shoulders, triceps",
    "PPL: Pull Day - Back and biceps", 
    "PPL: Leg Day - Complete lower body"
  ],
  "Upper/Lower": [
    "Upper Body Strength - Compound movements",
    "Lower Body Power - Strength and power workout"
  ],
  "Full Body": [
    "Full Body Beginner - Perfect starter routine"
  ],
  "Quick Workout": [
    "Quick 30-Min Power - High-intensity for busy days",
    "Express Muscle Builder - Quick but effective"
  ]
};

const templates = [
  // 6 MUSCLE GROUP SPECIFIC TEMPLATES
  { name: "Chest Domination", exercises: 6, duration: "60min", difficulty: "Intermediate" },
  { name: "Back Builder", exercises: 6, duration: "65min", difficulty: "Intermediate" },
  { name: "Leg Crusher", exercises: 7, duration: "80min", difficulty: "Advanced" },
  { name: "Shoulder Sculptor", exercises: 6, duration: "55min", difficulty: "Intermediate" },
  { name: "Arm Annihilator", exercises: 7, duration: "50min", difficulty: "Intermediate" },
  { name: "Core Crusher", exercises: 6, duration: "35min", difficulty: "Beginner" },
  
  // 3 PPL TEMPLATES  
  { name: "PPL: Push Day", exercises: 6, duration: "75min", difficulty: "Intermediate" },
  { name: "PPL: Pull Day", exercises: 6, duration: "70min", difficulty: "Intermediate" },
  { name: "PPL: Leg Day", exercises: 5, duration: "80min", difficulty: "Intermediate" },
  
  // 2 UPPER/LOWER TEMPLATES
  { name: "Upper Body Strength", exercises: 5, duration: "60min", difficulty: "Intermediate" },
  { name: "Lower Body Power", exercises: 6, duration: "70min", difficulty: "Advanced" },
  
  // 1 FULL BODY TEMPLATE
  { name: "Full Body Beginner", exercises: 5, duration: "45min", difficulty: "Beginner" },
  
  // 2 QUICK WORKOUT TEMPLATES
  { name: "Quick 30-Min Power", exercises: 4, duration: "30min", difficulty: "Intermediate" },
  { name: "Express Muscle Builder", exercises: 5, duration: "25min", difficulty: "Intermediate" }
];

console.log(`Ready to create ${templates.length} templates:`);
templates.forEach((template, index) => {
  console.log(`${index + 1}. ${template.name} (${template.category}) - ${template.exercises.length} exercises`);
});

console.log("\nTo seed the database:");
console.log("1. Go to Convex Dashboard");
console.log("2. Navigate to Functions tab");
console.log("3. Run: workoutTemplates.seedPreBuiltTemplates()");
console.log("4. Or call the function from your frontend app");

export {};