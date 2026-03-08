import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_CONVEX_URL: z.string().url().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),
  CLERK_JWT_ISSUER_DOMAIN: z.string().url().optional(),
  CONVEX_DEPLOYMENT: z.string().min(1).optional(),
  CONVEX_DEPLOY_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

type RequiredEnv<K extends keyof Env> = Env & {
  [P in K]-?: NonNullable<Env[P]>;
};

/**
 * Validates environment variables at runtime. Import and call where env is needed
 * (e.g. in API routes, server components). Extend the schema when adding Clerk, Convex, etc.
 */
export function getEnv(): Env {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    CLERK_JWT_ISSUER_DOMAIN: process.env.CLERK_JWT_ISSUER_DOMAIN,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    CONVEX_DEPLOY_KEY: process.env.CONVEX_DEPLOY_KEY,
  });

  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export function requireEnv<K extends keyof Env>(
  ...keys: K[]
): RequiredEnv<K> {
  const env = getEnv();
  const missingKeys = keys.filter((key) => {
    const value = env[key];
    return value === undefined || value === "";
  });

  if (missingKeys.length > 0) {
    throw new Error(`Missing environment variables: ${missingKeys.join(", ")}`);
  }

  return env as RequiredEnv<K>;
}
