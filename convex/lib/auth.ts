import type { QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function getConvexUserFromIdentity(
  ctx: Pick<QueryCtx, "db">,
  clerkId: string
): Promise<{ _id: Id<"users">; name: string } | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();
}
