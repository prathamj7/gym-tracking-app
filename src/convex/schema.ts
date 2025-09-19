import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    exercises: defineTable({
      userId: v.id("users"),
      name: v.string(),
      category: v.string(),
      sets: v.number(),
      reps: v.number(),
      weight: v.optional(v.number()),
      duration: v.optional(v.number()),
      notes: v.optional(v.string()),
      // When the exercise was actually performed (allows logging to any date)
      performedAt: v.number(),
    })
      .index("by_user", ["userId"])
      // Add composite index to support category filtering efficiently
      .index("by_user_and_category", ["userId", "category"])
      // For date range and name-based queries and comparisons
      .index("by_user_and_name_and_performedAt", ["userId", "name", "performedAt"])
      // Added: for fast date range exports across all exercises
      .index("by_user_and_performedAt", ["userId", "performedAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;