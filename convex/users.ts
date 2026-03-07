import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    webhookSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.webhookSecret !== process.env.CLERK_WEBHOOK_SECRET) {
      throw new Error("Invalid webhook secret");
    }
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
