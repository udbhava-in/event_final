// convex/queries.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTeamByInviteCode = query({
  args: { invite_code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("registrations")
      .withIndex("by_invite_code", (q) => q.eq("invite_code", args.invite_code))
      .first();
  },
});

export const getTeamById = query({
  args: { team_id: v.id("registrations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.team_id);
  },
});

export const getTeamMembers = query({
  args: { team_id: v.id("registrations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("team_members")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
      .collect();
  },
});

export const getUserTeams = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    // Get teams where user is the leader
    const ownedTeams = await ctx.db
      .query("registrations")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
      .collect();

    // Get teams where user is a member
    const memberships = await ctx.db
      .query("team_members")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
      .collect();

    const memberTeams = await Promise.all(
      memberships
        .filter((m) => m.status === "approved")
        .map((m) => ctx.db.get(m.team_id)),
    );

    // Combine and deduplicate
    const allTeams = [...ownedTeams, ...memberTeams.filter(Boolean)];
    const uniqueTeams = allTeams.filter((team, index, arr) =>
      arr.findIndex((t) => t?._id === team?._id) === index
    );

    return uniqueTeams;
  },
});

export const getFileUrl = query({
  args: { storage_id: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storage_id);
  },
});
