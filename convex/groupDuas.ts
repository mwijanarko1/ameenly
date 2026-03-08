import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getConvexUserFromIdentity } from "./lib/auth";
import { enforceAuthenticatedDuaRateLimit } from "./lib/duaRateLimits";

export const listGroupDuas = query({
  args: {
    groupId: v.id("groups"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return { page: [], isDone: true, continueCursor: "" };

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user)
      return { page: [], isDone: true, continueCursor: "" };

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership)
      return { page: [], isDone: true, continueCursor: "" };

    const result = await ctx.db
      .query("duas")
      .withIndex("by_group_wall", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .paginate(args.paginationOpts);

    const pageWithAuthors = await Promise.all(
      result.page.map(async (dua) => {
        const author = dua.authorId
          ? await ctx.db.get("users", dua.authorId)
          : null;
        const existing = await ctx.db
          .query("ameens")
          .withIndex("by_dua_and_user", (q) =>
            q.eq("duaId", dua._id).eq("userId", user._id)
          )
          .first();
        return {
          ...dua,
          authorName: author?.name ?? "Anonymous",
          hasCurrentUserSaidAmeen: !!existing,
        };
      })
    );

    return {
      ...result,
      page: pageWithAuthors,
    };
  },
});

export const submitGroupDua = mutation({
  args: {
    groupId: v.id("groups"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) throw new Error("User not found. Please complete sign-up.");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", user._id)
      )
      .first();

    if (!membership) throw new Error("You are not a member of this group");

    const trimmedText = args.text.trim();

    if (!trimmedText) throw new Error("Dua text is required");
    if (trimmedText.length > 2000) throw new Error("Dua text must be 2000 characters or less");

    await enforceAuthenticatedDuaRateLimit(ctx, user._id);

    return await ctx.db.insert("duas", {
      text: trimmedText,
      groupId: args.groupId,
      authorId: user._id,
      createdAt: Date.now(),
      ameen: 0,
    });
  },
});

export const deleteGroupDua = mutation({
  args: {
    groupId: v.id("groups"),
    duaId: v.id("duas"),
  },
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
      throw new Error("Only group admins can delete duas");
    }

    const dua = await ctx.db.get("duas", args.duaId);
    if (!dua || dua.groupId !== args.groupId) {
      throw new Error("Dua not found");
    }

    await ctx.db.delete(args.duaId);
  },
});
