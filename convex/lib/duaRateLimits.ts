import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

type DbContext = Pick<QueryCtx, "db">;

export const GUEST_PUBLIC_DUA_LIMIT = 1;
export const GUEST_PUBLIC_DUA_WINDOW_MS = 24 * 60 * 60 * 1000;

export const AUTHENTICATED_DUA_LIMIT = 50;
export const AUTHENTICATED_DUA_WINDOW_MS = 60 * 60 * 1000;

export async function enforceGuestPublicDuaRateLimit(
  ctx: DbContext,
  ipHash: string
) {
  const cutoff = Date.now() - GUEST_PUBLIC_DUA_WINDOW_MS;
  const recentDuas = await ctx.db
    .query("duas")
    .withIndex("by_ip_and_time", (q) =>
      q.eq("ipHash", ipHash).gte("createdAt", cutoff)
    )
    .collect();

  if (recentDuas.length >= GUEST_PUBLIC_DUA_LIMIT) {
    throw new Error(
      "Rate limit reached. Guests can submit 1 dua every 24 hours."
    );
  }
}

export async function enforceAuthenticatedDuaRateLimit(
  ctx: DbContext,
  authorId: Id<"users">
) {
  const cutoff = Date.now() - AUTHENTICATED_DUA_WINDOW_MS;
  const recentDuas = await ctx.db
    .query("duas")
    .withIndex("by_author_and_time", (q) =>
      q.eq("authorId", authorId).gte("createdAt", cutoff)
    )
    .collect();

  if (recentDuas.length >= AUTHENTICATED_DUA_LIMIT) {
    throw new Error(
      "Rate limit reached. Signed-in users can submit up to 50 duas per hour."
    );
  }
}
