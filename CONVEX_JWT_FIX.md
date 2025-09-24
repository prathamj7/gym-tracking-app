# 🔧 CRITICAL FIX: Create Convex JWT Template

## The Error:
```
Uncaught (in promise) e: No JWT template exists with name: convex
```

## 🎯 What This Means:
Your Clerk dashboard doesn't have a JWT template named "convex" that your app is trying to use.

## ✅ Fix Steps (Do this NOW):

### Step 1: Go to JWT Templates
1. Open https://dashboard.clerk.com
2. Select your application
3. Go to **"Configure"** → **"JWT Templates"** in the left sidebar

### Step 2: Create Convex Template
1. Click **"New template"** button
2. From the template list, select **"Convex"** 
3. ⚠️ **IMPORTANT**: The template name MUST be exactly **"convex"** (lowercase)
4. Click **"Create"**

### Step 3: Copy the Issuer URL
1. After creating the template, you'll see an **"Issuer"** field
2. Copy this URL (it should be something like `https://correct-cicada-58.clerk.accounts.dev`)
3. This should match what you have in your `.env` file

### Step 4: Verify Your .env File
Make sure your `.env` has:
```env
CLERK_JWT_ISSUER_DOMAIN=https://correct-cicada-58.clerk.accounts.dev
```

### Step 5: Update Convex Dashboard
1. Go to https://dashboard.convex.dev
2. Select your gym-tracking-app project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add/update: `CLERK_JWT_ISSUER_DOMAIN` = `https://correct-cicada-58.clerk.accounts.dev`

### Step 6: Redeploy
```bash
npx convex deploy
```

### Step 7: Test
1. Clear browser cache/cookies
2. Go to `localhost:5173/auth`
3. Try signing in - the JWT error should be gone!

## 🎯 Why This Template is Needed:
- Clerk uses JWT templates to generate tokens for different services
- Your app requests a token with template "convex"
- Without this template, Clerk returns a 404 error
- This template tells Clerk how to format the JWT for Convex to understand

After creating the "convex" JWT template, your authentication should work perfectly! 🚀