/** @type {import('next').NextConfig} */
function toOrigin(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function buildCsp() {
  const convexOrigin = toOrigin(process.env.NEXT_PUBLIC_CONVEX_URL);
  const clerkOrigin = toOrigin(process.env.CLERK_JWT_ISSUER_DOMAIN);
  const connectSources = [
    "'self'",
    convexOrigin,
    clerkOrigin,
    "https://*.convex.cloud",
    "wss://*.convex.cloud",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.dev",
    "https://*.clerk.com",
    "https://*.clerk.services",
  ].filter(Boolean);
  const frameSources = [
    "'self'",
    clerkOrigin,
    "https://*.clerk.accounts.dev",
    "https://*.clerk.dev",
    "https://*.clerk.com",
    "https://challenges.cloudflare.com",
  ].filter(Boolean);
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    "https://*.clerk.accounts.dev",
    "https://*.clerk.dev",
    "https://challenges.cloudflare.com",
  ];

  if (process.env.NODE_ENV !== "production") {
    scriptSources.push("'unsafe-eval'");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    `frame-src ${frameSources.join(" ")}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; ");
}

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: buildCsp(),
          },
        ],
      },
    ];
  },
};

export default nextConfig; 
