# 🔐 Clerk Configuration Guide - Email OTP + Google OAuth Only

## 🎯 **Your Authentication Setup:**
- **Google Sign-Up**: One-click registration with Google account
- **Email OTP Sign-In**: Passwordless login with email verification code
- **No Passwords**: Users never create or remember passwords
- **No Phone Numbers**: Email-only identification

## 📋 **Clerk Dashboard Configuration:**

### 1. **Authentication Methods** (Go to "Authentication" in sidebar)

**✅ ENABLE:**
- **Email (Email Code)** ← This enables OTP to email
- **Google OAuth** ← For social sign-up

**❌ DISABLE:**
- **Password** ← No password storage/creation
- **Phone** ← No phone number requirement
- **Username** ← Email-only identification
- **Apple** ← Not needed for your use case
- **Facebook, Twitter, etc.** ← Only Google for simplicity

### 2. **Contact Information** (Authentication → Email, Phone, Username)
- **Email address**: **Required** ✅
- **Phone number**: **Don't require** ❌
- **Username**: **Don't require** ❌

### 3. **Multi-factor Authentication** (Authentication → Multi-factor)
- **Disable all MFA options** ❌
  - SMS code: Off
  - Authenticator app (TOTP): Off
  - Backup codes: Off

### 4. **Sign-up Restrictions** (Authentication → Restrictions)
- **Allow sign-ups**: **Yes** ✅
- **Restrict sign-ups by domain**: Configure if needed
- **Block email subaddresses**: Your choice

## 🔄 **User Experience Flow:**

### **New Users (Sign-Up):**
1. Click "Continue with Google" → Instant account creation ✅
2. Or enter email → Get OTP → Account created ✅

### **Returning Users (Sign-In):**
1. Enter email → Get 6-digit OTP → Sign in ✅
2. Or click "Continue with Google" → Instant sign-in ✅

## 🎨 **UI Benefits:**
- **Simplified**: Only email input + Google button
- **Fast**: No password typing or remembering
- **Secure**: OTP ensures email ownership
- **Modern**: Passwordless authentication trend

## ⚙️ **Technical Details:**
- **JWT tokens** for secure API access
- **Automatic user sync** between Clerk and Convex
- **Session management** handled by Clerk
- **Dark theme** matching your app design

This setup provides **maximum security with minimum friction**! 🚀