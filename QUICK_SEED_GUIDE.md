# Quick Template Seeding for Testing

## Option 1: Add Seed Button to Dashboard (Recommended for Testing)

Add this to your Dashboard.tsx file temporarily:

```tsx
// Import at the top
import TemplateSeedButton from "@/components/TemplateSeedButton";

// Add inside the main content area (around line 420)
<div className="space-y-6">
  {/* Add this temporarily for testing */}
  <TemplateSeedButton />
  
  {/* Your existing content */}
  <StatsCards />
  {/* ... rest of dashboard */}
</div>
```

## Option 2: Use Convex Dashboard

1. Open Convex Dashboard in browser
2. Go to Functions tab
3. Find `workoutTemplates:seedPreBuiltTemplates`
4. Click "Run" with empty arguments `{}`

## Option 3: Browser Console

Open browser console on your app and run:
```javascript
// This will be available in your app's global scope
await convex.mutation(api.workoutTemplates.seedPreBuiltTemplates, {});
```

## After Seeding

Once seeded successfully, you should see:
- 6 pre-built templates in the Templates modal
- Templates organized by category
- PPL templates, Full Body, Upper/Lower, and Quick Workout templates

The seed button will show "Templates Seeded!" when complete.

## Clean Up

Remove the TemplateSeedButton import and component from Dashboard.tsx after testing is complete.