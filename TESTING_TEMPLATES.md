/**
 * Workout Templates Testing Guide
 * 
 * This guide helps you manually test the workout templates functionality
 * to ensure everything works correctly before moving to the next phase.
 */

# Workout Templates - Testing Checklist

## 🚀 Getting Started

### 1. Start the Application
```bash
npm run dev
```

### 2. Start Convex Backend
```bash
npx convex dev
```

### 3. Seed Pre-built Templates (First Time Only)
In Convex Dashboard or run in app:
```javascript
// This will populate the database with 6 pre-built workout templates
await api.workoutTemplates.seedPreBuiltTemplates()
```

## ✅ Testing Checklist

### Dashboard Integration
- [ ] **Templates Button Visible**: Check that "Templates" button appears in navigation (desktop)
- [ ] **Mobile Menu**: Verify Templates option in mobile hamburger menu
- [ ] **Modal Opens**: Click Templates button opens the templates modal
- [ ] **Modal Closes**: X button and outside clicks close the modal properly

### Template Library Interface
- [ ] **Tab Navigation**: Browse, Popular, Recent, My Templates tabs all work
- [ ] **Category Filters**: All, Push/Pull/Legs, Full Body, etc. filter correctly
- [ ] **Template Cards**: Each template shows name, description, difficulty, duration
- [ ] **Difficulty Badges**: Green (Beginner), Yellow (Intermediate), Red (Advanced)
- [ ] **Exercise Count**: Shows correct number of exercises per template

### Template Details
- [ ] **Details Modal**: "Details" button opens template details modal
- [ ] **Exercise List**: Shows all exercises with sets, reps, rest times
- [ ] **Template Info**: Duration, exercise count, category displayed correctly
- [ ] **Start Workout**: "Start This Workout" button works

### Pre-built Templates (After Seeding)
- [ ] **PPL: Push Day**: 6 exercises, 75 min, Intermediate
- [ ] **PPL: Pull Day**: 6 exercises, 70 min, Intermediate  
- [ ] **PPL: Leg Day**: 5 exercises, 80 min, Intermediate
- [ ] **Full Body Beginner**: 5 exercises, 45 min, Beginner
- [ ] **Upper Body Strength**: 5 exercises, 60 min, Intermediate
- [ ] **Quick 30-Min Power**: 4 exercises, 30 min, Intermediate

### Premium Integration
- [ ] **Free User Limits**: Shows "0/3" template count for free users
- [ ] **Create Template Button**: Disabled when limit reached (free users)
- [ ] **Premium Badge**: Premium users see unlimited template indicator
- [ ] **Template Creation**: Only works within limits

### Template Workflow
- [ ] **Start Workout**: Clicking "Start Workout" closes templates modal
- [ ] **Exercise Pre-fill**: Exercise form opens with first exercise from template
- [ ] **Template Usage**: Usage count should increment when starting workouts

## 🐛 Common Issues to Check

### Missing Components
- **Error**: `Cannot resolve '@/components/ui/tabs'`
- **Fix**: Ensure all UI components are properly installed

### Missing Indexes
- **Error**: Database query errors about missing indexes
- **Fix**: Ensure Convex schema includes all required indexes

### Premium Integration
- **Error**: Subscription tier not detected correctly
- **Fix**: Verify useSubscriptionTier hook is working

### Template Data
- **Error**: Templates not loading or showing as empty
- **Fix**: Run seedPreBuiltTemplates function first

## 📱 Responsive Testing

### Desktop (≥1024px)
- [ ] Templates button in main navigation
- [ ] Full template grid (3 columns)
- [ ] All template information visible
- [ ] Modal properly centered

### Tablet (768px - 1023px)
- [ ] Templates in mobile menu
- [ ] Template grid (2 columns)
- [ ] Template cards readable
- [ ] Modal fits screen

### Mobile (≤767px)
- [ ] Templates in hamburger menu
- [ ] Single column template grid
- [ ] Cards stack properly
- [ ] Modal scrollable

## 🔧 Performance Testing

### Loading States
- [ ] Loading spinner shows while fetching templates
- [ ] No flash of empty content
- [ ] Smooth transitions between states

### Data Fetching
- [ ] Templates load quickly after opening modal
- [ ] Category filtering is instant (client-side)
- [ ] Template details load smoothly

### Memory Usage
- [ ] Modal closes properly without memory leaks
- [ ] Template data doesn't accumulate unnecessarily
- [ ] Images (if any) load efficiently

## 🎯 User Experience Testing

### First-Time User
- [ ] Templates library makes sense without explanation
- [ ] Pre-built templates provide good variety
- [ ] Template difficulty levels are clear
- [ ] Getting started is intuitive

### Returning User
- [ ] Recent templates show up correctly
- [ ] Personal templates are easily accessible
- [ ] Usage tracking works properly
- [ ] Template limits are clear

## 🚨 Error Scenarios

### Network Issues
- [ ] Graceful handling of failed template loads
- [ ] Retry mechanisms work
- [ ] Error messages are helpful

### Authentication
- [ ] Unauthenticated users can't access templates
- [ ] User template permissions respected
- [ ] Premium features properly gated

### Edge Cases
- [ ] Empty template lists handled gracefully
- [ ] Very long template names don't break layout
- [ ] Large numbers of templates perform well

## ✅ Ready for Next Phase

Once all items above are checked and working:

1. **Document any issues found**
2. **Confirm core template workflow works end-to-end**  
3. **Verify premium integration functions correctly**
4. **Ready to implement Template Creation Form**

## 🎉 Success Criteria

The templates system is ready when:
- ✅ All pre-built templates are accessible and functional
- ✅ Users can browse, filter, and view template details
- ✅ Premium limits are properly enforced
- ✅ Starting workouts from templates works smoothly
- ✅ No critical bugs or performance issues
- ✅ Mobile and desktop experiences are polished

---

**Next Step**: Once testing is complete, we can move on to implementing the Template Creation Form for users to build their own custom workout templates!