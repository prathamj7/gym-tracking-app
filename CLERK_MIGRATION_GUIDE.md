# Clerk Authentication Migration Guide

This guide will help you migrate from the current vly.ai authentication system to Clerk.

## Step 1: Install Required Packages

Run these commands in your terminal:

```bash
# Install Clerk packages
pnpm add @clerk/clerk-react @clerk/themes
pnpm add -D @clerk/types

# Install Convex-Clerk integration
pnpm add convex-clerk
```

## Step 2: Environment Variables

Create/update your `.env` file with:

```env
# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Convex Configuration  
VITE_CONVEX_URL=your_existing_convex_url
CONVEX_DEPLOY_KEY=your_existing_deploy_key

# Optional: Keep existing vly config as backup
VLY_APP_NAME=your_app_name
```

## Step 3: Clerk Dashboard Setup

1. Go to https://clerk.com and create an account
2. Create a new application
3. Configure authentication methods:
   - ✅ Email (with OTP verification)
   - ✅ Google OAuth
   - ✅ Phone number (SMS OTP)
4. Copy your publishable key from the API Keys section
5. Note your JWT issuer domain (e.g., `your-app-123.clerk.accounts.dev`)

## Step 4: Update Convex Environment

In your Convex dashboard, add:

```
CLERK_JWT_ISSUER_DOMAIN=your-app-123.clerk.accounts.dev
```

## Step 5: File Updates Required

The following files have been prepared for you:

### New Files:
- `src/hooks/use-auth-clerk.ts` - New auth hook using Clerk
- `src/pages/ClerkAuth.tsx` - New auth page with Clerk components
- `src/main-clerk.tsx` - Updated app entry point with Clerk providers

### Modified Files:
- `src/convex/auth.ts` - Updated to use Clerk (needs package install first)
- `src/convex/users.ts` - Added Clerk user sync functionality

### Files to Update After Installation:
1. Replace `src/main.tsx` with `src/main-clerk.tsx`
2. Replace `src/hooks/use-auth.ts` with `src/hooks/use-auth-clerk.ts`
3. Update imports in `src/pages/Dashboard.tsx`, `src/pages/Landing.tsx`

## Step 6: Testing Checklist

After installation and setup:

- [ ] Users can sign up with email + OTP
- [ ] Users can sign in with Google
- [ ] Users can sign up with phone + SMS OTP
- [ ] Protected routes redirect to /auth when not signed in
- [ ] Authenticated users see dashboard
- [ ] User profile data syncs correctly
- [ ] Sign out works properly
- [ ] Convex queries require authentication

## Step 7: Cleanup (Optional)

After confirming everything works:

- Remove `src/convex/auth/emailOtp.ts`
- Remove `src/pages/Auth.tsx` (old auth page)
- Remove vly.ai related environment variables
- Remove unused dependencies:
  ```bash
  pnpm remove oslo axios
  ```

## Rollback Plan

If you need to rollback:
1. Restore original `src/main.tsx`
2. Restore original `src/hooks/use-auth.ts`
3. Restore original `src/convex/auth.ts`
4. Remove Clerk environment variables
5. Re-add vly.ai environment variables

## Support

If you encounter issues:
1. Check Clerk dashboard logs
2. Check browser console for errors
3. Verify environment variables are set
4. Ensure Convex is configured with correct JWT issuer

Ready to proceed? Complete steps 1-4 first, then let me know and I'll help update the remaining files!