import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation } from "./_generated/server";
import { getConvexUserFromIdentity } from "./lib/auth";

async function deleteUserData(ctx: {
  db: import("./_generated/server").MutationCtx["db"];
}, userId: Id<"users">) {
  // 1. Delete all ameens by this user
  const userAmeens = await ctx.db
    .query("ameens")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const ameen of userAmeens) {
    await ctx.db.delete(ameen._id);
  }

  // 2. For each group created by this user: cascade delete
  const createdGroups = await ctx.db
    .query("groups")
    .withIndex("by_creator", (q) => q.eq("creatorId", userId))
    .collect();

  for (const group of createdGroups) {
    const groupDuas = await ctx.db
      .query("duas")
      .withIndex("by_group_wall", (q) => q.eq("groupId", group._id))
      .collect();

    for (const dua of groupDuas) {
      const duaAmeens = await ctx.db
        .query("ameens")
        .withIndex("by_dua", (q) => q.eq("duaId", dua._id))
        .collect();
      for (const ameen of duaAmeens) {
        await ctx.db.delete(ameen._id);
      }
      await ctx.db.delete(dua._id);
    }

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", group._id))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(group._id);
  }

  // 3. Anonymize remaining duas authored by this user (public + groups they joined)
  const authoredDuas = await ctx.db
    .query("duas")
    .withIndex("by_author_and_time", (q) => q.eq("authorId", userId))
    .collect();

  for (const dua of authoredDuas) {
    await ctx.db.patch(dua._id, {
      authorId: undefined,
      name: undefined,
      isAnonymous: true,
    });
  }

  // 4. Delete remaining groupMember records (groups they joined but didn't create)
  const memberships = await ctx.db
    .query("groupMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const membership of memberships) {
    await ctx.db.delete(membership._id);
  }

  // 5. Delete siteAdmins record if present (uses clerkId; get from user before delete)
  const userDoc = await ctx.db.get(userId);
  if (userDoc) {
    const adminRecord = await ctx.db
      .query("siteAdmins")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userDoc.clerkId))
      .first();
    if (adminRecord) {
      await ctx.db.delete(adminRecord._id);
    }
  }

  // 6. Delete the user record
  await ctx.db.delete(userId);
}

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) throw new Error("User not found");

    await deleteUserData(ctx, user._id);
  },
});

export const deleteUserDataByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return;

    await deleteUserData(ctx, user._id);
  },
});

export const upsertUserFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
    });
  },
});
