import { query, QueryCtx } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getCurrentUserIdentity, getClerkUserId } from "./auth";

// Clerk webhook to sync user data
export const syncUserFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name || existingUser.name,
        image: args.imageUrl || existingUser.image,
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name || "",
        image: args.imageUrl,
        // Set default role
        role: "user" as any,
      });
      return userId;
    }
  },
});

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const identity = await getCurrentUserIdentity(ctx);
  if (!identity) {
    return null;
  }
  
  // Look up user by Clerk ID in the subject field
  const user = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", identity.email || ""))
    .first();
    
  return user;
};

/**
 * Save or update the current user's name.
 */
export const setName = mutation({
  args: {
    firstName: v.string(),
  lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const fullName = `${args.firstName} ${args.lastName}`.trim();
    await ctx.db.patch(user._id, { name: fullName });
  },
});

export const setProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    age: v.optional(v.number()),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const fullName = `${args.firstName} ${args.lastName}`.trim();
    await ctx.db.patch(user._id, {
      name: fullName,
      ...(typeof args.age === "number" ? { age: args.age } : {}),
      ...(typeof args.weight === "number" ? { weight: args.weight } : {}),
    });
  },
});