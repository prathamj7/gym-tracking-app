# 🔧 Debug Authentication Issue

## Problem: Stuck in sign-in loop, not reaching dashboard

### Step 1: Add Environment Variable to Convex Dashboard
1. Go to https://dashboard.convex.dev
2. Select your project 
3. Go to **Settings** → **Environment Variables**
4. Add: `CLERK_JWT_ISSUER_DOMAIN` = `https://correct-cicada-58.clerk.accounts.dev`
5. Redeploy with: `npx convex deploy`

### Step 2: Check Browser Console
Open developer tools (F12) and check for errors:
- Authentication errors
- Network errors
- JWT validation errors

### Step 3: Test Authentication Flow
1. Clear browser storage (cookies, localStorage)
2. Try signing in with phone number
3. Check if you get redirected to dashboard

### Step 4: Verify Convex Connection
Run these commands:
```bash
npx convex dev --verbose
```

### Step 5: Check Clerk Configuration
1. In Clerk dashboard, go to **Authentication**:
   - ✅ Email (Email Code) should be ENABLED
   - ✅ Google OAuth should be ENABLED  
   - ❌ Password should be DISABLED
   - ❌ Phone should be DISABLED
2. Go to **JWT Templates** and ensure "convex" template exists
3. Verify the issuer domain matches your env variable
4. Check **Email, Phone, Username** settings:
   - Email: Required ✅
   - Phone: Don't require ❌
   - Username: Don't require ❌

## Common Issues:
- ❌ JWT issuer domain not set in Convex
- ❌ Network/firewall blocking requests  
- ❌ User sync failing between Clerk and Convex
- ❌ Missing CORS configuration

Let me know what errors you see in the console!