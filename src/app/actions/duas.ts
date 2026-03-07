"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

function getClientIp(): string {
  const headersList = headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export async function submitPublicDua(formData: FormData) {
  const text = formData.get("text") as string | null;
  const name = (formData.get("name") as string | null) || undefined;

  if (!text?.trim()) {
    return { error: "Dua text is required" };
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return { error: "Server configuration error" };
  }

  const ip = getClientIp();
  const ipHash = hashIp(ip);

  const client = new ConvexHttpClient(convexUrl);

  try {
    await client.mutation(api.duas.submitPublicDua, {
      text: text.trim(),
      name: name?.trim() || undefined,
      ipHash,
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    if (message.includes("Rate limit")) {
      return { error: "Rate limit reached. You can submit up to 5 duas per 24 hours." };
    }
    return { error: message };
  }
}
