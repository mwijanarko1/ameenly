import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import {
  getConvexUserFromIdentity,
  getOrCreateConvexUser,
  getOrCreateConvexUserFromClerkId,
} from "./lib/auth";
import {
  enforceAuthenticatedDuaRateLimit,
  enforceGuestPublicDuaRateLimit,
} from "./lib/duaRateLimits";
import {
  isVisibleOnPublicWall,
  moderateGuestSubmission,
} from "./lib/guestModeration";

const publicDuaValidator = v.object({
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

const myDuaValidator = v.object({
  _id: v.id("duas"),
  _creationTime: v.number(),
  text: v.string(),
  groupId: v.optional(v.id("groups")),
  name: v.optional(v.string()),
  isAnonymous: v.boolean(),
  createdAt: v.number(),
  ameen: v.number(),
  visibility: v.union(v.literal("group"), v.literal("public")),
  groupName: v.optional(v.string()),
  hasCurrentUserSaidAmeen: v.boolean(),
});

const ameenDuaValidator = v.object({
  _id: v.id("duas"),
  _creationTime: v.number(),
  text: v.string(),
  groupId: v.optional(v.id("groups")),
  name: v.optional(v.string()),
  isAnonymous: v.boolean(),
  createdAt: v.number(),
  ameen: v.number(),
  authorName: v.optional(v.string()),
  visibility: v.union(v.literal("group"), v.literal("public")),
  groupName: v.optional(v.string()),
});

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
        _id: dua._id,
        _creationTime: dua._creationTime,
        text: dua.text,
        groupId: dua.groupId,
        name: dua.name,
        isAnonymous: dua.isAnonymous ?? false,
        createdAt: dua.createdAt,
        ameen: dua.ameen,
        authorName: dua.isAnonymous ? undefined : author?.name,
        hasCurrentUserSaidAmeen,
      };
    })
  );
}

export const listPublicDuas = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(publicDuaValidator),
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

    const visibleDuas = result.page.filter((dua) =>
      isVisibleOnPublicWall(dua.moderationStatus)
    );

    let page = await enrichPublicDuasWithAuthors(ctx, visibleDuas, user?._id);

    if (user) {
      const ameens = await ctx.db
        .query("ameens")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      const excludeSet = new Set(ameens.map((a) => a.duaId));
      page = page.filter((dua) => !excludeSet.has(dua._id));
    }

    return {
      ...result,
      page,
    };
  },
});

export const submitGuestPublicDua = mutation({
  args: {
    text: v.string(),
    name: v.optional(v.string()),
    isAnonymous: v.boolean(),
    ipHash: v.string(),
  },
  returns: v.object({
    duaId: v.id("duas"),
    status: v.union(v.literal("published"), v.literal("queued_for_review")),
  }),
  handler: async (ctx, args) => {
    const trimmedText = normalizeDuaText(args.text);
    const trimmedName = normalizeOptionalName(args.name);
    const isAnonymous = args.isAnonymous;

    if (!isAnonymous && !trimmedName) {
      throw new Error("Name is required unless you post anonymously");
    }

    await enforceGuestPublicDuaRateLimit(ctx, args.ipHash);

    const moderation = moderateGuestSubmission({
      text: trimmedText,
      name: isAnonymous ? undefined : trimmedName,
    });

    const moderationStatus =
      moderation.outcome === "review" ? "pending_review" : "approved";
    const submissionStatus: "published" | "queued_for_review" =
      moderationStatus === "pending_review"
        ? "queued_for_review"
        : "published";
    const duaId = await ctx.db.insert("duas", {
      text: trimmedText,
      name: isAnonymous ? undefined : trimmedName,
      isAnonymous,
      ipHash: args.ipHash,
      createdAt: Date.now(),
      ameen: 0,
      moderationStatus,
      moderationReasons:
        moderation.reasons.length > 0 ? moderation.reasons : undefined,
    });

    return {
      duaId,
      status: submissionStatus,
    };
  },
});

export const submitAuthenticatedPublicDua = mutation({
  args: {
    text: v.string(),
    isAnonymous: v.boolean(),
  },
  returns: v.id("duas"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await getOrCreateConvexUser(ctx, {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
    });

    const trimmedText = normalizeDuaText(args.text);

    await enforceAuthenticatedDuaRateLimit(ctx, user._id);

    return await ctx.db.insert("duas", {
      text: trimmedText,
      isAnonymous: args.isAnonymous,
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
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateConvexUserFromClerkId(ctx, args.clerkId);

    const trimmedText = normalizeDuaText(args.text);

    await enforceAuthenticatedDuaRateLimit(ctx, user._id);

    return await ctx.db.insert("duas", {
      text: trimmedText,
      isAnonymous: args.isAnonymous,
      authorId: user._id,
      createdAt: Date.now(),
      ameen: 0,
    });
  },
});

export const listDuasUserSaidAmeenTo = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(ameenDuaValidator),
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
      .query("ameens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (ameen) => {
        const dua = await ctx.db.get("duas", ameen.duaId);
        if (!dua) return null;
        const author = dua.authorId
          ? await ctx.db.get("users", dua.authorId)
          : null;
        const group = dua.groupId ? await ctx.db.get("groups", dua.groupId) : null;
        const visibility: "group" | "public" = dua.groupId ? "group" : "public";
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
          visibility,
          groupName: group?.name,
        };
      })
    );

    const filteredPage = page.filter((d): d is NonNullable<typeof d> => d !== null);

    return {
      ...result,
      page: filteredPage,
    };
  },
});

export const listMyDuas = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(myDuaValidator),
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
        const visibility: "group" | "public" = dua.groupId ? "group" : "public";

        return {
          _id: dua._id,
          _creationTime: dua._creationTime,
          text: dua.text,
          groupId: dua.groupId,
          name: dua.name,
          isAnonymous: dua.isAnonymous ?? false,
          createdAt: dua.createdAt,
          ameen: dua.ameen,
          visibility,
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
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Sign in to say Ameen");
    }

    const user = await getOrCreateConvexUser(ctx, {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
    });

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
    return null;
  },
});
