// convex/schema.ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  registrations: defineTable({
    user_id: v.string(),
    user_name: v.string(),
    email: v.string(),
    team_name: v.string(),
    members: v.number(),
    college: v.string(),
    event_choice: v.union(
      v.literal("Tech"),
      v.literal("Non Tech"),
      v.literal("Gaming"),
    ),
    student_type: v.union(v.literal("UG"), v.literal("PU")),
    specific_event: v.optional(v.string()),
    transaction_id: v.optional(v.string()),
    invite_code: v.string(),
    payment_screenshot_storage_id: v.optional(v.id("_storage")),
    payment_screenshot_filename: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_invite_code", ["invite_code"]),

  team_members: defineTable({
    team_id: v.id("registrations"),
    user_id: v.string(),
    user_name: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved")),
    joined_at: v.number(),
  })
    .index("by_team_id", ["team_id"])
    .index("by_user_id", ["user_id"])
    .index("by_team_and_user", ["team_id", "user_id"]),
});
