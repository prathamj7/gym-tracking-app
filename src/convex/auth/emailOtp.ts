import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    // TODO: Replace with your preferred email service
    // VLY email service has been removed
    console.log(`OTP for ${email}: ${token}`);
    
    // For development, log the OTP to console
    // In production, integrate with SendGrid, AWS SES, or another email provider
    throw new Error("Email service not configured. Check console for OTP token during development.");
  },
});
