import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getSiteAdminByClerkId, requireSiteAdmin } from "./lib/siteAdminAuth";

const pendingGuestDuaValidator = v.object({
  _id: v.id("duas"),
  _creationTime: v.number(),
  text: v.string(),
  name: v.optional(v.string()),
  isAnonymous: v.boolean(),
  createdAt: v.number(),
  moderationReasons: v.array(v.string()),
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
