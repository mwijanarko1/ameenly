import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { getConvexUserFromIdentity, getOrCreateConvexUser } from "./lib/auth";
import { enforceAuthenticatedDuaRateLimit } from "./lib/duaRateLimits";

const groupDuaValidator = v.object({
  _id: v.id("duas"),
  _creationTime: v.number(),
  text: v.string(),
  groupId: v.optional(v.id("groups")),
  name: v.optional(v.string()),
  isAnonymous: v.boolean(),
  createdAt: v.number(),
  ameen: v.number(),
  authorName: v.optional(v.string()),
  hasCurrentUserSaidAmeen: v.boolean(),
});

export const listGroupDuas = query({
  args: {
    groupId: v.id("groups"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(groupDuaValidator),
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

    const ameens = await ctx.db
      .query("ameens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const excludeSet = new Set(ameens.map((a) => a.duaId));

    const pageWithAuthors = await Promise.all(
      result.page
        .filter((dua) => !excludeSet.has(dua._id))
        .map(async (dua) => {
          const author = dua.authorId
            ? await ctx.db.get("users", dua.authorId)
            : null;
          return {
            _id: dua._id,
            _creationTime: dua._creationTime,
            text: dua.text,
            groupId: dua.groupId,
            name: dua.name,
            isAnonymous: dua.isAnonymous ?? false,
            createdAt: dua.createdAt,
            ameen: dua.ameen,
            authorName: dua.isAnonymous ? undefined : author?.name,
            hasCurrentUserSaidAmeen: false,
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
    isAnonymous: v.boolean(),
  },
  returns: v.id("duas"),
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

    if (!membership) throw new Error("You are not a member of this group");

    const trimmedText = args.text.trim();

    if (!trimmedText) throw new Error("Dua text is required");
    if (trimmedText.length > 2000) throw new Error("Dua text must be 2000 characters or less");

    await enforceAuthenticatedDuaRateLimit(ctx, user._id);

    return await ctx.db.insert("duas", {
      text: trimmedText,
      groupId: args.groupId,
      isAnonymous: args.isAnonymous,
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
  returns: v.null(),
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
      throw new Error("Only group admins can delete duas");
    }

    const dua = await ctx.db.get("duas", args.duaId);
    if (!dua || dua.groupId !== args.groupId) {
      throw new Error("Dua not found");
    }

    await ctx.db.delete(args.duaId);
    return null;
  },
});
