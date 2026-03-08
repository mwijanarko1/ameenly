import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nanoid } from "nanoid";
import { getConvexUserFromIdentity, getOrCreateConvexUser } from "./lib/auth";

const groupValidator = v.object({
  _id: v.id("groups"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.optional(v.string()),
  creatorId: v.id("users"),
  inviteCode: v.string(),
  createdAt: v.number(),
});

const membershipValidator = v.object({
  _id: v.id("groupMembers"),
  _creationTime: v.number(),
  groupId: v.id("groups"),
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("member")),
  joinedAt: v.number(),
});

const groupWithMembershipValidator = v.object({
  group: groupValidator,
  membership: membershipValidator,
});

const invitePreviewValidator = v.object({
  groupId: v.id("groups"),
  groupName: v.string(),
  description: v.optional(v.string()),
  memberCount: v.number(),
  isAlreadyMember: v.boolean(),
});

const memberWithUserValidator = v.object({
  _id: v.id("groupMembers"),
  _creationTime: v.number(),
  groupId: v.id("groups"),
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("member")),
  joinedAt: v.number(),
  userName: v.string(),
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.object({ groupId: v.id("groups"), inviteCode: v.string() }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getOrCreateConvexUser(ctx, {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
    });

    const trimmedName = args.name.trim();
    const trimmedDescription = args.description?.trim();

    if (!trimmedName) throw new Error("Group name is required");
    if (trimmedName.length > 100) throw new Error("Group name must be 100 characters or less");
    if (trimmedDescription && trimmedDescription.length > 300) {
      throw new Error("Description must be 300 characters or less");
    }

    const inviteCode = nanoid(10);
    const groupId = await ctx.db.insert("groups", {
      name: trimmedName,
      description: trimmedDescription || undefined,
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

    return { groupId, inviteCode };
  },
});

export const joinGroup = mutation({
  args: { inviteCode: v.string() },
  returns: v.id("groups"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getOrCreateConvexUser(ctx, {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
    });

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

export const promoteToAdmin = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminUser = await getOrCreateConvexUser(ctx, {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
    });

    const adminMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", adminUser._id)
      )
      .first();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new Error("Only group admins can promote members");
    }

    const targetMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!targetMembership) throw new Error("Member not found");
    if (targetMembership.role === "admin") throw new Error("User is already an admin");

    await ctx.db.patch(targetMembership._id, { role: "admin" });
    return null;
  },
});

export const getMyGroups = query({
  args: {},
  returns: v.array(groupValidator),
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

    return groups.filter(
      (group): group is NonNullable<typeof group> => group !== null
    );
  },
});

export const getGroup = query({
  args: { groupId: v.id("groups") },
  returns: v.union(groupValidator, v.null()),
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
  returns: v.union(groupWithMembershipValidator, v.null()),
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

export const getGroupWithMembershipByInviteCode = query({
  args: { inviteCode: v.string() },
  returns: v.union(groupWithMembershipValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) return null;

    const group = await ctx.db
      .query("groups")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!group) return null;

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", group._id).eq("userId", user._id)
      )
      .first();

    if (!membership) return null;

    return { group, membership };
  },
});

export const removeMember = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminUser = await getOrCreateConvexUser(ctx, {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
    });

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
    return null;
  },
});

export const generateNewInviteCode = mutation({
  args: { groupId: v.id("groups") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getOrCreateConvexUser(ctx, {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
    });

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
  returns: v.union(groupValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();
  },
});

export const getInvitePreview = query({
  args: { inviteCode: v.string() },
  returns: v.union(invitePreviewValidator, v.null()),
  handler: async (ctx, args) => {
    const group = await ctx.db
      .query("groups")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();

    if (!group) {
      return null;
    }

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", group._id))
      .collect();

    const identity = await ctx.auth.getUserIdentity();
    let membership = null;

    if (identity) {
      const user = await getConvexUserFromIdentity(ctx, identity.subject);

      if (user) {
        membership = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_and_user", (q) =>
            q.eq("groupId", group._id).eq("userId", user._id)
          )
          .first();
      }
    }

    return {
      groupId: group._id,
      groupName: group.name,
      description: group.description,
      memberCount: members.length,
      isAlreadyMember: Boolean(membership),
    };
  },
});

export const getGroupMembers = query({
  args: { groupId: v.id("groups") },
  returns: v.union(v.array(memberWithUserValidator), v.null()),
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
