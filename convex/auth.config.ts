import type { AuthConfig } from "convex/server";

/**
 * CLERK_JWT_ISSUER_DOMAIN is set in Convex dashboard (dev deployment).
 * Replace the placeholder with your real Clerk Frontend API URL:
 * 1. Go to https://dashboard.clerk.com/apps/setup/convex
 * 2. Activate Convex integration
 * 3. Copy the Frontend API URL (e.g. https://verb-noun-00.clerk.accounts.dev)
 * 4. Update in Convex: https://dashboard.convex.dev/d/oceanic-wren-903/settings/environment-variables
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
