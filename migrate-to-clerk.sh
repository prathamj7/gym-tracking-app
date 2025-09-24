#!/bin/bash

# Clerk Authentication Migration Script
# Run this script to complete the Clerk integration

echo "🚀 Starting Clerk Authentication Migration..."

# Step 1: Install required packages
echo "📦 Installing Clerk packages..."
pnpm add @clerk/clerk-react @clerk/themes convex-clerk
pnpm add -D @clerk/types

# Step 2: Check environment variables
echo "🔍 Checking environment variables..."
if [ -z "$VITE_CLERK_PUBLISHABLE_KEY" ]; then
    echo "❌ Missing VITE_CLERK_PUBLISHABLE_KEY in .env file"
    echo "Please add your Clerk publishable key to .env"
    exit 1
fi

# Step 3: Backup original files
echo "💾 Creating backups..."
cp src/main.tsx src/main-backup.tsx
cp src/hooks/use-auth.ts src/hooks/use-auth-backup.ts
cp src/pages/Auth.tsx src/pages/Auth-backup.tsx

# Step 4: Replace files with Clerk versions
echo "🔄 Updating files for Clerk..."
cp src/main-clerk.tsx src/main.tsx
cp src/hooks/use-auth-clerk.ts src/hooks/use-auth.ts
# Note: ClerkAuth.tsx is already created as the new auth page

# Step 5: Update convex deployment
echo "🏗️ Deploying Convex changes..."
npx convex deploy

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Test sign up with email/phone"
echo "2. Test Google OAuth"
echo "3. Verify protected routes work"
echo "4. Check user profile sync"
echo ""
echo "If anything breaks, restore from backups:"
echo "  cp src/main-backup.tsx src/main.tsx"
echo "  cp src/hooks/use-auth-backup.ts src/hooks/use-auth.ts"