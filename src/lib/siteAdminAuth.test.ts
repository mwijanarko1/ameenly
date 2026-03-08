import { describe, expect, it } from "vitest";
import { getSiteAdminByClerkId, requireSiteAdmin } from "../../convex/lib/siteAdminAuth";

function createSiteAdminContext({
  identity,
  siteAdmin,
}: {
  identity: { subject: string } | null;
  siteAdmin: { _id: string; clerkId: string; createdAt: number; note?: string } | null;
}) {
  return {
    auth: {
      getUserIdentity() {
        return Promise.resolve(identity);
      },
    },
    db: {
      query() {
        return {
          withIndex(_indexName: string, callback: (query: { eq: (_field: string, value: string) => string }) => string) {
            callback({
              eq: (_field: string, value: string) => value,
            });
            return {
              first() {
                return Promise.resolve(siteAdmin);
              },
            };
          },
        };
      },
    },
  };
}

describe("siteAdminAuth", () => {
  it("looks up a site admin by Clerk ID", async () => {
    const ctx = createSiteAdminContext({
      identity: { subject: "user_123" },
      siteAdmin: {
        _id: "admin_1",
        clerkId: "user_123",
        createdAt: 1,
      },
    });

    await expect(
      getSiteAdminByClerkId(ctx as never, "user_123")
    ).resolves.toEqual({
      _id: "admin_1",
      clerkId: "user_123",
      createdAt: 1,
    });
  });

  it("throws when the current user is not authenticated", async () => {
    const ctx = createSiteAdminContext({
      identity: null,
      siteAdmin: null,
    });

    await expect(requireSiteAdmin(ctx as never)).rejects.toThrow("Not authenticated");
  });

  it("throws when the current user is not a site admin", async () => {
    const ctx = createSiteAdminContext({
      identity: { subject: "user_123" },
      siteAdmin: null,
    });

    await expect(requireSiteAdmin(ctx as never)).rejects.toThrow("Not authorized");
  });

  it("returns the site admin record for authorized users", async () => {
    const ctx = createSiteAdminContext({
      identity: { subject: "user_123" },
      siteAdmin: {
        _id: "admin_1",
        clerkId: "user_123",
        createdAt: 1,
      },
    });

    await expect(requireSiteAdmin(ctx as never)).resolves.toEqual({
      _id: "admin_1",
      clerkId: "user_123",
      createdAt: 1,
    });
  });
});
