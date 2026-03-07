import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nanoid } from "nanoid";
import { getConvexUserFromIdentity } from "./lib/auth";

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) throw new Error("User not found. Please complete sign-up.");

    if (!args.name.trim()) throw new Error("Group name is required");
    if (args.name.length > 100) throw new Error("Group name must be 100 characters or less");

    const inviteCode = nanoid(10);
    const groupId = await ctx.db.insert("groups", {
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      creatorId: user._id,
      inviteCode,
      createdAt: Date.now(),
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user._id,
      role: "admin",
      joinedAt: Date.now(),
    });

    return groupId;
  },
});

export const joinGroup = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) throw new Error("User not found. Please complete sign-up.");

    const group = await ctx.db
      .query("groups")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!group) throw new Error("Invalid invite code");

    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", group._id).eq("userId", user._id)
      )
      .first();

    if (existing) return group._id;

    await ctx.db.insert("groupMembers", {
      groupId: group._id,
      userId: user._id,
      role: "member",
      joinedAt: Date.now(),
    });

    return group._id;
  },
});

export const getMyGroups = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) return [];

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const groups = await Promise.all(
      memberships.map((m) => ctx.db.get("groups", m.groupId))
    );

    return groups.filter(Boolean);
  },
});

export const getGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) return null;

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    return await ctx.db.get("groups", args.groupId);
  },
});

export const getGroupWithMembership = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) return null;

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    const group = await ctx.db.get("groups", args.groupId);
    if (!group) return null;

    return { group, membership };
  },
});

export const removeMember = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminUser = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!adminUser) throw new Error("User not found");

    const adminMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", adminUser._id)
      )
      .first();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new Error("Only group admins can remove members");
    }

    const targetMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!targetMembership) throw new Error("Member not found");

    if (targetMembership.role === "admin") {
      throw new Error("Cannot remove another admin");
    }

    await ctx.db.delete(targetMembership._id);
  },
});

export const generateNewInviteCode = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) throw new Error("User not found");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only group admins can regenerate invite codes");
    }

    const newCode = nanoid(10);
    await ctx.db.patch(args.groupId, { inviteCode: newCode });
    return newCode;
  },
});

export const getGroupByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();
  },
});

export const getGroupMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) return null;

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership || membership.role !== "admin") return null;

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const u = await ctx.db.get("users", m.userId);
        return { ...m, userName: u?.name ?? "Unknown" };
      })
    );

    return membersWithUsers;
  },
});
