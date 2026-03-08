import type { MutationCtx, QueryCtx } from "../_generated/server";
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

/**
 * Gets the Convex user for the given Clerk identity, creating one on-demand
 * if the user doesn't exist yet (e.g. webhook race, dev without webhook).
 */
export async function getOrCreateConvexUser(
  ctx: Pick<MutationCtx, "db">,
  identity: { subject: string; name?: string | null; email?: string | null }
): Promise<{ _id: Id<"users">; name: string }> {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (existing) return existing;

  const name = (identity.name ?? "User").trim() || "User";
  const userId = await ctx.db.insert("users", {
    clerkId: identity.subject,
    name,
    email: identity.email ?? undefined,
  });
  return { _id: userId, name };
}

/**
 * Same as getOrCreateConvexUser but when only clerkId is available (e.g. server action).
 * Creates user with default name "User" if not found.
 */
export async function getOrCreateConvexUserFromClerkId(
  ctx: Pick<MutationCtx, "db">,
  clerkId: string
): Promise<{ _id: Id<"users">; name: string }> {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();
  if (existing) return existing;
  const userId = await ctx.db.insert("users", {
    clerkId,
    name: "User",
  });
  return { _id: userId, name: "User" };
}
