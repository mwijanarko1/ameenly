import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

const PUBLIC_RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export const listPublicDuas = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("duas")
      .withIndex("by_public_wall", (q) => q.eq("groupId", undefined))
      .order("desc", "createdAt")
      .paginate(args.paginationOpts);
  },
});

export const submitPublicDua = mutation({
  args: {
    text: v.string(),
    name: v.optional(v.string()),
    ipHash: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.text.trim()) {
      throw new Error("Dua text is required");
    }
    if (args.text.length > 2000) {
      throw new Error("Dua text must be 2000 characters or less");
    }

    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    const recentCount = await ctx.db
      .query("duas")
      .withIndex("by_ip_and_time", (q) =>
        q.eq("ipHash", args.ipHash).gte("createdAt", cutoff)
      )
      .collect();

    if (recentCount.length >= PUBLIC_RATE_LIMIT) {
      throw new Error(
        "Rate limit reached. You can submit up to 5 duas per 24 hours."
      );
    }

    return await ctx.db.insert("duas", {
      text: args.text.trim(),
      name: args.name?.trim() || undefined,
      ipHash: args.ipHash,
      createdAt: Date.now(),
      ameen: 0,
    });
  },
});

export const sayAmeen = mutation({
  args: { duaId: v.id("duas") },
  handler: async (ctx, args) => {
    const dua = await ctx.db.get("duas", args.duaId);
    if (!dua) {
      throw new Error("Dua not found");
    }
    await ctx.db.patch(args.duaId, { ameen: dua.ameen + 1 });
  },
});
