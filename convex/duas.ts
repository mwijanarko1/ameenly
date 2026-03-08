import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getConvexUserFromIdentity } from "./lib/auth";
import {
  enforceAuthenticatedDuaRateLimit,
  enforceGuestPublicDuaRateLimit,
} from "./lib/duaRateLimits";

function normalizeDuaText(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("Dua text is required");
  }
  if (trimmedText.length > 2000) {
    throw new Error("Dua text must be 2000 characters or less");
  }

  return trimmedText;
}

function normalizeOptionalName(name?: string) {
  const trimmedName = name?.trim();

  if (trimmedName && trimmedName.length > 100) {
    throw new Error("Name must be 100 characters or less");
  }

  return trimmedName || undefined;
}

async function enrichPublicDuasWithAuthors(
  ctx: Pick<QueryCtx, "db">,
  duas: Doc<"duas">[],
  currentUserId?: Id<"users">
) {
  return await Promise.all(
    duas.map(async (dua) => {
      const author = dua.authorId ? await ctx.db.get(dua.authorId) : null;
      let hasCurrentUserSaidAmeen = false;
      if (currentUserId) {
        const existing = await ctx.db
          .query("ameens")
          .withIndex("by_dua_and_user", (q) =>
            q.eq("duaId", dua._id).eq("userId", currentUserId)
          )
          .first();
        hasCurrentUserSaidAmeen = !!existing;
      }
      return {
        ...dua,
        authorName: author?.name,
        hasCurrentUserSaidAmeen,
      };
    })
  );
}

export const listPublicDuas = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const user = identity
      ? await getConvexUserFromIdentity(ctx, identity.subject)
      : null;

    const result = await ctx.db
      .query("duas")
      .withIndex("by_group_wall", (q) => q.eq("groupId", undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: await enrichPublicDuasWithAuthors(ctx, result.page, user?._id),
    };
  },
});

export const submitGuestPublicDua = mutation({
  args: {
    text: v.string(),
    name: v.optional(v.string()),
    ipHash: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmedText = normalizeDuaText(args.text);
    const trimmedName = normalizeOptionalName(args.name);

    await enforceGuestPublicDuaRateLimit(ctx, args.ipHash);

    return await ctx.db.insert("duas", {
      text: trimmedText,
      name: trimmedName || undefined,
      ipHash: args.ipHash,
      createdAt: Date.now(),
      ameen: 0,
    });
  },
});

export const submitAuthenticatedPublicDua = mutation({
  args: {
    text: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found. Please complete sign-up.");
    }

    const trimmedText = normalizeDuaText(args.text);
    const trimmedName = normalizeOptionalName(args.name);

    await enforceAuthenticatedDuaRateLimit(ctx, user._id);

    return await ctx.db.insert("duas", {
      text: trimmedText,
      name: trimmedName,
      authorId: user._id,
      createdAt: Date.now(),
      ameen: 0,
    });
  },
});

export const submitAuthenticatedPublicDuaFromServer = internalMutation({
  args: {
    clerkId: v.string(),
    text: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getConvexUserFromIdentity(ctx, args.clerkId);
    if (!user) {
      throw new Error("User not found. Please complete sign-up.");
    }

    const trimmedText = normalizeDuaText(args.text);
    const trimmedName = normalizeOptionalName(args.name);

    await enforceAuthenticatedDuaRateLimit(ctx, user._id);

    return await ctx.db.insert("duas", {
      text: trimmedText,
      name: trimmedName,
      authorId: user._id,
      createdAt: Date.now(),
      ameen: 0,
    });
  },
});

export const listMyDuas = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const result = await ctx.db
      .query("duas")
      .withIndex("by_author_and_time", (q) => q.eq("authorId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (dua) => {
        const group = dua.groupId ? await ctx.db.get(dua.groupId) : null;
        const existing = await ctx.db
          .query("ameens")
          .withIndex("by_dua_and_user", (q) =>
            q.eq("duaId", dua._id).eq("userId", user._id)
          )
          .first();

        return {
          ...dua,
          visibility: dua.groupId ? "group" : "public",
          groupName: group?.name,
          hasCurrentUserSaidAmeen: !!existing,
        };
      })
    );

    return {
      ...result,
      page,
    };
  },
});

export const sayAmeen = mutation({
  args: { duaId: v.id("duas") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Sign in to say Ameen");
    }

    const user = await getConvexUserFromIdentity(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found. Please complete sign-up.");
    }

    const dua = await ctx.db.get("duas", args.duaId);
    if (!dua) {
      throw new Error("Dua not found");
    }

    const existing = await ctx.db
      .query("ameens")
      .withIndex("by_dua_and_user", (q) =>
        q.eq("duaId", args.duaId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      throw new Error("You have already said Ameen to this dua");
    }

    await ctx.db.insert("ameens", {
      duaId: args.duaId,
      userId: user._id,
    });
    await ctx.db.patch(args.duaId, { ameen: dua.ameen + 1 });
  },
});
