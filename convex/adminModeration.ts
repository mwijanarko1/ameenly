import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { getSiteAdminByClerkId, requireSiteAdmin } from "./lib/siteAdminAuth";

const recentActivityItemValidator = v.object({
  _id: v.id("duas"),
  text: v.string(),
  moderationStatus: v.union(v.literal("approved"), v.literal("rejected")),
  moderatedAt: v.number(),
  name: v.optional(v.string()),
  isAnonymous: v.optional(v.boolean()),
});

const pendingGuestDuaValidator = v.object({
  _id: v.id("duas"),
  _creationTime: v.number(),
  text: v.string(),
  name: v.optional(v.string()),
  isAnonymous: v.boolean(),
  createdAt: v.number(),
  moderationReasons: v.array(v.string()),
});

const adminPublicDuaValidator = v.object({
  _id: v.id("duas"),
  _creationTime: v.number(),
  text: v.string(),
  name: v.optional(v.string()),
  isAnonymous: v.boolean(),
  createdAt: v.number(),
  ameen: v.number(),
  moderationStatus: v.optional(
    v.union(
      v.literal("approved"),
      v.literal("pending_review"),
      v.literal("rejected")
    )
  ),
  moderationReasons: v.optional(v.array(v.string())),
  authorName: v.optional(v.string()),
  isGuest: v.boolean(),
});

export const listPendingGuestDuas = query({
  args: {},
  returns: v.object({
    isAuthorized: v.boolean(),
    pendingDuas: v.array(pendingGuestDuaValidator),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        isAuthorized: false,
        pendingDuas: [],
      };
    }

    const siteAdmin = await getSiteAdminByClerkId(ctx, identity.subject);

    if (!siteAdmin) {
      return {
        isAuthorized: false,
        pendingDuas: [],
      };
    }

    const pendingDuas = await ctx.db
      .query("duas")
      .withIndex("by_moderation_status_and_time", (q) =>
        q.eq("moderationStatus", "pending_review")
      )
      .order("desc")
      .collect();

    return {
      isAuthorized: true,
      pendingDuas: pendingDuas
        .filter((dua) => dua.groupId === undefined && dua.authorId === undefined)
        .map((dua) => ({
          _id: dua._id,
          _creationTime: dua._creationTime,
          text: dua.text,
          name: dua.name,
          isAnonymous: dua.isAnonymous ?? false,
          createdAt: dua.createdAt,
          moderationReasons: dua.moderationReasons ?? [],
        })),
    };
  },
});

export const getAdminStats = query({
  args: {},
  returns: v.object({
    isAuthorized: v.boolean(),
    totalUsers: v.optional(v.number()),
    totalDuas: v.optional(v.number()),
    pendingModerationCount: v.optional(v.number()),
    totalGroups: v.optional(v.number()),
    totalAmeens: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { isAuthorized: false };
    }
    const siteAdmin = await getSiteAdminByClerkId(ctx, identity.subject);
    if (!siteAdmin) {
      return { isAuthorized: false };
    }

    const [users, duas, groups, ameens] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("duas").collect(),
      ctx.db.query("groups").collect(),
      ctx.db.query("ameens").collect(),
    ]);

    const pendingDuas = duas.filter(
      (d) =>
        d.groupId === undefined &&
        d.authorId === undefined &&
        d.moderationStatus === "pending_review"
    );

    return {
      isAuthorized: true,
      totalUsers: users.length,
      totalDuas: duas.length,
      pendingModerationCount: pendingDuas.length,
      totalGroups: groups.length,
      totalAmeens: ameens.length,
    };
  },
});

export const listAllPublicDuasForAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(adminPublicDuaValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    const siteAdmin = await getSiteAdminByClerkId(ctx, identity.subject);
    if (!siteAdmin) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const result = await ctx.db
      .query("duas")
      .withIndex("by_group_wall", (q) => q.eq("groupId", undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (dua) => {
        const author = dua.authorId ? await ctx.db.get(dua.authorId) : null;
        return {
          _id: dua._id,
          _creationTime: dua._creationTime,
          text: dua.text,
          name: dua.name,
          isAnonymous: dua.isAnonymous ?? false,
          createdAt: dua.createdAt,
          ameen: dua.ameen,
          moderationStatus: dua.moderationStatus,
          moderationReasons: dua.moderationReasons,
          authorName: dua.isAnonymous ? undefined : author?.name,
          isGuest: dua.authorId === undefined,
        };
      })
    );

    return {
      ...result,
      page,
    };
  },
});

export const listRecentActivity = query({
  args: {},
  returns: v.object({
    isAuthorized: v.boolean(),
    activity: v.array(recentActivityItemValidator),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { isAuthorized: false, activity: [] };
    }
    const siteAdmin = await getSiteAdminByClerkId(ctx, identity.subject);
    if (!siteAdmin) {
      return { isAuthorized: false, activity: [] };
    }

    const [approved, rejected] = await Promise.all([
      ctx.db
        .query("duas")
        .withIndex("by_moderation_status_and_time", (q) =>
          q.eq("moderationStatus", "approved")
        )
        .order("desc")
        .take(50),
      ctx.db
        .query("duas")
        .withIndex("by_moderation_status_and_time", (q) =>
          q.eq("moderationStatus", "rejected")
        )
        .order("desc")
        .take(50),
    ]);

    const merged = [...approved, ...rejected]
      .filter((d) => d.moderatedAt != null)
      .sort((a, b) => (b.moderatedAt ?? 0) - (a.moderatedAt ?? 0))
      .slice(0, 20)
      .map((dua) => ({
        _id: dua._id,
        text: dua.text,
        moderationStatus: dua.moderationStatus as "approved" | "rejected",
        moderatedAt: dua.moderatedAt!,
        name: dua.name,
        isAnonymous: dua.isAnonymous,
      }));

    return { isAuthorized: true, activity: merged };
  },
});

function normalizeDuaText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Dua text is required");
  if (trimmed.length > 2000) throw new Error("Dua text must be 2000 characters or less");
  return trimmed;
}

async function getPublicDuaOrThrow(ctx: MutationCtx, duaId: Id<"duas">) {
  const dua = await ctx.db.get(duaId);
  if (!dua) throw new Error("Dua not found");
  if (dua.groupId !== undefined) throw new Error("Only public duas can be edited here");
  return dua;
}

export const updatePublicDua = mutation({
  args: {
    duaId: v.id("duas"),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSiteAdmin(ctx);
    await getPublicDuaOrThrow(ctx, args.duaId);
    const normalizedText = normalizeDuaText(args.text);
    await ctx.db.patch(args.duaId, { text: normalizedText });
    return null;
  },
});

async function getPendingGuestDuaOrThrow(
  ctx: MutationCtx,
  duaId: Id<"duas">
) {
  const dua = await ctx.db.get(duaId);

  if (!dua) {
    throw new Error("Submission not found");
  }

  if (dua.groupId !== undefined || dua.authorId !== undefined) {
    throw new Error("Only guest public submissions can be moderated here");
  }

  if (dua.moderationStatus !== "pending_review") {
    throw new Error("Submission is not pending review");
  }

  return dua;
}

export const approveGuestDua = mutation({
  args: { duaId: v.id("duas") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const siteAdmin = await requireSiteAdmin(ctx);
    await getPendingGuestDuaOrThrow(ctx, args.duaId);

    await ctx.db.patch(args.duaId, {
      moderationStatus: "approved",
      moderatedAt: Date.now(),
      moderatedByAdminId: siteAdmin._id,
    });

    return null;
  },
});

export const rejectGuestDua = mutation({
  args: { duaId: v.id("duas") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const siteAdmin = await requireSiteAdmin(ctx);
    await getPendingGuestDuaOrThrow(ctx, args.duaId);

    await ctx.db.patch(args.duaId, {
      moderationStatus: "rejected",
      moderatedAt: Date.now(),
      moderatedByAdminId: siteAdmin._id,
    });

    return null;
  },
});
