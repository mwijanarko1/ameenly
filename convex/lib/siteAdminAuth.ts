import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;
type AuthCtx = Pick<QueryCtx, "auth" | "db"> | Pick<MutationCtx, "auth" | "db">;

export async function getSiteAdminByClerkId(
  ctx: DbCtx,
  clerkId: string
): Promise<Doc<"siteAdmins"> | null> {
  return await ctx.db
    .query("siteAdmins")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();
}

export async function requireSiteAdmin(ctx: AuthCtx): Promise<Doc<"siteAdmins">> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const siteAdmin = await getSiteAdminByClerkId(ctx, identity.subject);

  if (!siteAdmin) {
    throw new Error("Not authorized");
  }

  return siteAdmin;
}
