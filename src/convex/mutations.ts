import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate a random invite code
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const createRegistration = mutation({
  args: {
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
    payment_screenshot_storage_id: v.optional(v.id("_storage")),
    payment_screenshot_filename: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invite_code = generateInviteCode();

    const teamId = await ctx.db.insert("registrations", {
      ...args,
      invite_code,
      created_at: Date.now(),
    });

    // Add team leader as approved member
    await ctx.db.insert("team_members", {
      team_id: teamId,
      user_id: args.user_id,
      user_name: args.user_name,
      email: args.email,
      status: "approved",
      joined_at: Date.now(),
    });

    return teamId;
  },
});

export const addTeamMember = mutation({
  args: {
    team_id: v.id("registrations"),
    user_id: v.string(),
    user_name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is already in team
    const existing = await ctx.db
      .query("team_members")
      .withIndex(
        "by_team_and_user",
        (q) => q.eq("team_id", args.team_id).eq("user_id", args.user_id),
      )
      .first();

    if (existing) {
      throw new Error(
        "User is already part of this team or has a pending request",
      );
    }

    return await ctx.db.insert("team_members", {
      team_id: args.team_id,
      user_id: args.user_id,
      user_name: args.user_name,
      email: args.email,
      status: "pending",
      joined_at: Date.now(),
    });
  },
});

export const approveTeamMember = mutation({
  args: {
    team_id: v.id("registrations"),
    member_user_id: v.string(),
    leader_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify caller is team leader
    const team = await ctx.db.get(args.team_id);
    if (!team || team.user_id !== args.leader_user_id) {
      throw new Error("Unauthorized: Only team leader can approve members");
    }

    // Find the team member record
    const member = await ctx.db
      .query("team_members")
      .withIndex(
        "by_team_and_user",
        (q) => q.eq("team_id", args.team_id).eq("user_id", args.member_user_id),
      )
      .first();

    if (!member) {
      throw new Error("Member not found");
    }

    await ctx.db.patch(member._id, { status: "approved" });
    return { success: true };
  },
});

export const removeTeamMember = mutation({
  args: {
    team_id: v.id("registrations"),
    member_user_id: v.string(),
    leader_user_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify caller is team leader
    const team = await ctx.db.get(args.team_id);
    if (!team || team.user_id !== args.leader_user_id) {
      throw new Error("Unauthorized: Only team leader can remove members");
    }

    // Prevent removing team leader
    if (args.member_user_id === args.leader_user_id) {
      throw new Error("Cannot remove team leader");
    }

    // Find and delete the team member record
    const member = await ctx.db
      .query("team_members")
      .withIndex(
        "by_team_and_user",
        (q) => q.eq("team_id", args.team_id).eq("user_id", args.member_user_id),
      )
      .first();

    if (!member) {
      throw new Error("Member not found");
    }

    await ctx.db.delete(member._id);
    return { success: true };
  },
});
