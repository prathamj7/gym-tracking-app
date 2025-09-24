# Clerk Setup Instructions

## Step 1: Install Clerk Packages

Run these commands to install the required Clerk packages:

```bash
npm install @clerk/clerk-react @clerk/themes convex/react-clerk
```

## Step 2: Create Clerk Account & Configure Authentication

1. Go to https://clerk.com/ and create an account
2. Create a new application
3. **Configure Authentication Methods** (IMPORTANT):
   
   **Enable These:**
   - ✅ **Email (Email Code)** - For passwordless OTP login
   - ✅ **Google OAuth** - For easy social sign-up
   
   **Disable These:**
   - ❌ **Password** - We don't want users creating passwords
   - ❌ **Phone** - No phone number requirement
   - ❌ **Username** - Email-only identification
   
4. **In Authentication → Email, Phone, Username:**
   - Set **Email address** as **Required**
   - Set **Phone number** as **Don't require**
   - Set **Username** as **Don't require**

5. **In Authentication → Multi-factor:**
   - **Disable** all MFA options (SMS, TOTP, Backup codes)
   
6. Copy your Publishable Key and Secret Key

## Step 3: Add Environment Variables

Add these to your `.env` file:

```env
# Clerk Authentication - Only 2 variables needed!
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# No JWT issuer domain required - Clerk handles this automatically! ✅
```

## Step 4: Configure Convex for Clerk

Add to your Convex environment variables:

```
CLERK_JWT_ISSUER_DOMAIN=your-app-domain.clerk.accounts.dev
```

You can find your JWT issuer domain in your Clerk dashboard under "JWT Templates".

## Next Steps

After completing these steps, run the migration script that will:
1. Update your Convex auth configuration
2. Replace authentication components
3. Update routing logic
4. Sync user data properly