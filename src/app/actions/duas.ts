"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { api, internal } from "convex/_generated/api";
import { requireEnv } from "@/lib/env";

const submitPublicDuaSchema = z.object({
  text: z.string().trim().min(1, "Dua text is required").max(2000),
  name: z.string().trim().max(100).optional(),
  isAnonymous: z.boolean(),
});

export type SubmitPublicDuaResult =
  | { status: "published" }
  | { status: "queued_for_review" }
  | { error: string };

async function getClientIp(): Promise<string> {
  const headersList = await headers();
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

function extractConvexErrorMessage(raw: string): string {
  // Convex wraps thrown errors as:
  // "[Request ID: <id>] Server Error Uncaught Error: <message>\n  at ..."
  const match = /Uncaught Error: (.+?)(?:\n|$)/.exec(raw);
  if (match?.[1]) return match[1].trim();
  // Fallback: strip everything before the first newline that looks like a header
  const newlineIdx = raw.indexOf("\n");
  if (newlineIdx !== -1) return raw.slice(0, newlineIdx).trim();
  return raw;
}

export async function submitPublicDua(
  formData: FormData
): Promise<SubmitPublicDuaResult> {
  const parsed = submitPublicDuaSchema.safeParse({
    text: formData.get("text"),
    name: formData.get("name") || undefined,
    isAnonymous: formData.get("isAnonymous") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form submission" };
  }

  let convexUrl: string;
  try {
    ({ NEXT_PUBLIC_CONVEX_URL: convexUrl } = requireEnv("NEXT_PUBLIC_CONVEX_URL"));
  } catch {
    return { error: "Server configuration error" };
  }

  const { userId } = await auth();

  if (!userId && !parsed.data.isAnonymous && !parsed.data.name) {
    return { error: "Name is required unless you post anonymously" };
  }

  try {
    if (userId) {
      const { CONVEX_DEPLOY_KEY: convexDeployKey } = requireEnv("CONVEX_DEPLOY_KEY");
      const adminClient = new ConvexHttpClient(convexUrl) as ConvexHttpClient & {
        setAdminAuth: (token: string) => void;
      };
      adminClient.setAdminAuth(convexDeployKey);

      await adminClient.mutation(
        internal.duas.submitAuthenticatedPublicDuaFromServer as unknown as Parameters<
          ConvexHttpClient["mutation"]
        >[0],
        {
          clerkId: userId,
          text: parsed.data.text,
          isAnonymous: parsed.data.isAnonymous,
        }
      );

      return { status: "published" };
    } else {
      const ip = await getClientIp();
      const ipHash = hashIp(ip);
      const client = new ConvexHttpClient(convexUrl);

      const result = await client.mutation(api.duas.submitGuestPublicDua, {
        text: parsed.data.text,
        name: parsed.data.name || undefined,
        isAnonymous: parsed.data.isAnonymous,
        ipHash,
      });

      return { status: result.status };
    }
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Something went wrong";
    const message = extractConvexErrorMessage(raw);
    return { error: message };
  }
}
