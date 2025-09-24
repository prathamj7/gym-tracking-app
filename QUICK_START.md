# 🚀 Quick Clerk Installation Guide

## 📦 Install Required Packages

Run this command in your terminal:

```bash
npm install @clerk/clerk-react @clerk/themes convex/react-clerk
```

## 🔑 Environment Variables Setup

Add these to your `.env` file:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

## 🔄 File Replacements

After installing packages, replace these files:

1. Replace `src/main.tsx` with `src/main-clerk.tsx`
2. Replace `src/hooks/use-auth.ts` with `src/hooks/use-auth-clerk.ts`

Or run these commands:

```bash
# Windows PowerShell
Move-Item src\main.tsx src\main-original.tsx
Move-Item src\main-clerk.tsx src\main.tsx
Move-Item src\hooks\use-auth.ts src\hooks\use-auth-original.ts
Move-Item src\hooks\use-auth-clerk.ts src\hooks\use-auth.ts
```

## 🎯 Final Steps

1. Get your Clerk keys from https://clerk.com
2. Update your `.env` file with real keys
3. Start your development server: `npm run dev`

## ✅ Your app is now using Clerk authentication!

- Email/password login ✅
- Google OAuth ✅  
- Phone number authentication ✅
- User profile management ✅
- Protected routes ✅

---

**Need help?** Check `CLERK_MIGRATION_GUIDE.md` for detailed instructions.