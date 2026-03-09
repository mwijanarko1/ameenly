import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { api, internal } from "./_generated/api";
import {
  normalizeReportCount,
  normalizeReportedDuaRecord,
} from "./lib/adminModeration";
import { getSiteAdminByClerkId, requireSiteAdmin } from "./lib/siteAdminAuth";

export const isSiteAdmin = query({
  args: {},
  returns: v.object({ isAdmin: v.boolean() }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { isAdmin: false };
    const siteAdmin = await getSiteAdminByClerkId(ctx, identity.subject);
    return { isAdmin: siteAdmin !== null };
  },
});

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

const adminUserValidator = v.object({
  _id: v.id("users"),
  clerkId: v.string(),
  name: v.string(),
  email: v.optional(v.string()),
  _creationTime: v.number(),
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

const reportedDuaValidator = v.object({
  _id: v.id("duas"),
  _creationTime: v.number(),
  text: v.string(),
  name: v.optional(v.string()),
  isAnonymous: v.boolean(),
  createdAt: v.number(),
  ameen: v.number(),
  reportCount: v.number(),
  reportReasons: v.array(v.string()),
  moderationStatus: v.optional(
    v.union(
      v.literal("approved"),
      v.literal("pending_review"),
      v.literal("rejected")
    )
  ),
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
    reportedDuasCount: v.optional(v.number()),
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

    const reportedDuas = duas.filter(
      (d) =>
        d.groupId === undefined &&
        normalizeReportCount(d.reportCount) >= 1
    );

    return {
      isAuthorized: true,
      totalUsers: users.length,
      totalDuas: duas.length,
      pendingModerationCount: pendingDuas.length,
      totalGroups: groups.length,
      totalAmeens: ameens.length,
      reportedDuasCount: reportedDuas.length,
    };
  },
});

export const listAllUsers = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(adminUserValidator),
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
      .query("users")
      .withIndex("by_creation_time")
      .order("desc")
      .paginate(args.paginationOpts);

    const page = result.page.map((user) => ({
      _id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      _creationTime: user._creationTime,
    }));

    return {
      ...result,
      page,
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

    // Use filter for groupId undefined (undefined is not valid in Convex index eq())
    const result = await ctx.db
      .query("duas")
      .withIndex("by_creation_time")
      .filter((q) => q.eq(q.field("groupId"), undefined))
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

export const listReportedDuas = query({
  args: {},
  returns: v.object({
    isAuthorized: v.boolean(),
    reportedDuas: v.array(reportedDuaValidator),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { isAuthorized: false, reportedDuas: [] };
    }
    const siteAdmin = await getSiteAdminByClerkId(ctx, identity.subject);
    if (!siteAdmin) {
      return { isAuthorized: false, reportedDuas: [] };
    }

    const reportedDuas = await ctx.db
      .query("duas")
      .collect()
      .then((duas) =>
        duas
          .filter(
            (dua) =>
              dua.groupId === undefined &&
              normalizeReportCount(dua.reportCount) >= 1
          )
          .sort(
            (left, right) =>
              normalizeReportCount(right.reportCount) -
              normalizeReportCount(left.reportCount)
          )
          .slice(0, 100)
      );

    const page = await Promise.all(
      reportedDuas.map(async (dua) => {
        const author = dua.authorId ? await ctx.db.get(dua.authorId) : null;
        return normalizeReportedDuaRecord(dua, author?.name);
      })
    );

    return {
      isAuthorized: true,
      reportedDuas: page,
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

async function getReportedPublicDuaOrThrow(
  ctx: MutationCtx,
  duaId: Id<"duas">
) {
  const dua = await ctx.db.get(duaId);
  if (!dua) throw new Error("Dua not found");
  if (dua.groupId !== undefined) throw new Error("Only public duas can be resolved here");
  if (normalizeReportCount(dua.reportCount) < 1) throw new Error("Dua has no reports");
  return dua;
}

export const resolveReportedDua = mutation({
  args: {
    duaId: v.id("duas"),
    action: v.union(v.literal("dismiss"), v.literal("reject")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const siteAdmin = await requireSiteAdmin(ctx);
    await getReportedPublicDuaOrThrow(ctx, args.duaId);

    if (args.action === "dismiss") {
      await ctx.db.patch(args.duaId, {
        reportCount: 0,
        reportReasons: [],
      });
    } else {
      await ctx.db.patch(args.duaId, {
        reportCount: 0,
        reportReasons: [],
        moderationStatus: "rejected",
        moderatedAt: Date.now(),
        moderatedByAdminId: siteAdmin._id,
      });
    }

    // Clear report records
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_dua", (q) => q.eq("duaId", args.duaId))
      .collect();
    for (const report of reports) {
      await ctx.db.delete(report._id);
    }

    return null;
  },
});

export const _getUserForAdmin = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(v.object({ clerkId: v.string() }), v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const siteAdmin = await getSiteAdminByClerkId(ctx, identity.subject);
    if (!siteAdmin) return null;
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return { clerkId: user.clerkId };
  },
});

export const deleteUserAndData = action({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const isAdminResult = await ctx.runQuery(api.adminModeration.isSiteAdmin, {});
    if (!isAdminResult?.isAdmin) {
      throw new Error("Not authorized");
    }

    const user = await ctx.runQuery(internal.adminModeration._getUserForAdmin, {
      userId: args.userId,
    });
    if (!user || user.clerkId !== args.clerkId) {
      throw new Error("User not found or clerkId mismatch");
    }

    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret) {
      throw new Error("CLERK_SECRET_KEY is not configured");
    }

    const clerkRes = await fetch(
      `https://api.clerk.com/v1/users/${encodeURIComponent(args.clerkId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${clerkSecret}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!clerkRes.ok) {
      const body = await clerkRes.text();
      throw new Error(`Clerk API error: ${clerkRes.status} ${body}`);
    }

    await ctx.runMutation(internal.adminModeration._deleteUserConvexData, {
      userId: args.userId,
    });
    return null;
  },
});

export const _deleteUserConvexData = internalMutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = args.userId;

    // 1. Delete ameens by this user
    const userAmeens = await ctx.db
      .query("ameens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const a of userAmeens) {
      await ctx.db.delete(a._id);
    }

    // 2. Delete duas authored by this user (and their ameens)
    const authoredDuas = await ctx.db
      .query("duas")
      .withIndex("by_author_and_time", (q) => q.eq("authorId", userId))
      .collect();
    for (const dua of authoredDuas) {
      const duaAmeens = await ctx.db
        .query("ameens")
        .withIndex("by_dua", (q) => q.eq("duaId", dua._id))
        .collect();
      for (const a of duaAmeens) {
        await ctx.db.delete(a._id);
      }
      await ctx.db.delete(dua._id);
    }

    // 3. Delete groups created by this user (and their contents)
    const ownedGroups = await ctx.db
      .query("groups")
      .withIndex("by_creator", (q) => q.eq("creatorId", userId))
      .collect();
    for (const group of ownedGroups) {
      const groupDuas = await ctx.db
        .query("duas")
        .withIndex("by_group_wall", (q) => q.eq("groupId", group._id))
        .collect();
      for (const dua of groupDuas) {
        const duaAmeens = await ctx.db
          .query("ameens")
          .withIndex("by_dua", (q) => q.eq("duaId", dua._id))
          .collect();
        for (const a of duaAmeens) {
          await ctx.db.delete(a._id);
        }
        await ctx.db.delete(dua._id);
      }
      const members = await ctx.db
        .query("groupMembers")
        .withIndex("by_group", (q) => q.eq("groupId", group._id))
        .collect();
      for (const m of members) {
        await ctx.db.delete(m._id);
      }
      await ctx.db.delete(group._id);
    }

    // 4. Delete remaining group memberships for this user
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const m of memberships) {
      await ctx.db.delete(m._id);
    }

    // 5. Delete reports made by this user
    const userReports = await ctx.db
      .query("reports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const r of userReports) {
      await ctx.db.delete(r._id);
    }

    // 6. Delete the user record
    await ctx.db.delete(userId);
    return null;
  },
});
