import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

const { NEXT_PUBLIC_APP_URL } = getEnv();
const appUrl =
  NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "production" ? "https://ameenly.com" : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/sign-in/", "/sign-up/", "/profile/", "/join/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
