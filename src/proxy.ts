import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/admin(.*)",
]);

const CANONICAL_HOST = "ameenly.com";

export default clerkMiddleware(async (auth, req) => {
  // Canonicalize www → non-www in production
  const host = req.nextUrl.hostname;
  if (host === `www.${CANONICAL_HOST}`) {
    const url = req.nextUrl.clone();
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 301);
  }

  const pathname = req.nextUrl.pathname;
  const isGroupsSubpath = pathname.startsWith("/groups/");
  const isProtected = isGroupsSubpath || isProtectedRoute(req);

  if (isProtected) {
    await auth.protect();
  }
}, {
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
