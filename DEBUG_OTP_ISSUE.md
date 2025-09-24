# 🔍 Debug OTP "Incorrect Code" Issue

## ✅ What's Working:
- Google sign-in works perfectly ✅
- JWT template is configured correctly ✅
- Convex integration is working ✅

## ❌ The Problem:
OTP codes always show "Incorrect code" even when entered correctly.

## 🔧 Debugging Steps:

### Step 1: Check Your Email
1. **Check your Gmail inbox** for `pratjoshi7@gmail.com`
2. **Look for email from Clerk** (might be in Spam/Promotions)
3. **Email subject**: Usually "Your sign-in code for [App Name]"
4. **Make sure you're using the LATEST code** (not an old one)

### Step 2: Verify Email in Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Go to **"Configure"** → **"Email & SMS"**
3. Check if **"Email verification code"** is properly configured
4. Look for any warnings or issues with email delivery

### Step 3: Check Development Mode Limitations
Clerk in development mode has some limitations:
- Email delivery might be slower
- Some email providers might block development emails
- Rate limiting might be stricter

### Step 4: Try These Solutions:

#### Solution A: Wait Longer
- Wait **2-3 minutes** after requesting OTP
- Check **all email folders** (Inbox, Spam, Promotions, Updates)

#### Solution B: Use Test Email
- Go to Clerk dashboard → **"Configure"** → **"Email & SMS"** 
- Look for **"Test mode"** or **"Development emails"**
- Some development setups show test codes in the dashboard

#### Solution C: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for any errors when submitting OTP
4. Check **Network** tab for failed requests

### Step 5: Alternative Test
Try this flow to isolate the issue:
1. **Use Google sign-in first** (we know this works)
2. Then **sign out**
3. Try **email OTP** with the same email address

## 🤔 Common Causes:

1. **Email not delivered**: Check spam folder
2. **Old code**: Using expired OTP (they expire quickly)
3. **Wrong email**: Make sure you're checking the right email account  
4. **Development limitations**: Clerk dev mode email delays
5. **Rate limiting**: Too many attempts in short time

## 💡 Quick Test:
Try entering **any random 6-digit code** - if you get the same "Incorrect code" error immediately, the issue might be with the OTP validation logic rather than the actual code.

Let me know what you find in your email and browser console! 📧