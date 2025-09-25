/**
 * Simple script to seed workout templates
 * Run this once to populate the database with pre-built templates
 */

// You can run this in the Convex dashboard or call it from the frontend
// This is the seed data that gets inserted by the seedPreBuiltTemplates function

console.log("Workout Templates Seed Data:");
console.log("===========================");

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