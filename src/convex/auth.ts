// Simple authentication helpers for Clerk JWT integration
// Note: This file will work with standard Convex JWT auth after Clerk is configured

// Get current user identity from JWT token
export const getCurrentUserIdentity = async (ctx: any) => {
  return await ctx.auth.getUserIdentity();
};

// Helper to check if user is authenticated  
export const isAuthenticated = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  return identity !== null;
};

// Get Clerk user ID from JWT token
export const getClerkUserId = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return identity.subject; // This will be the Clerk user ID
};