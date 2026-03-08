import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { internal } from "convex/_generated/api";
import { requireEnv } from "@/lib/env";

export async function POST(req: Request) {
  let webhookSecret: string;
  let convexUrl: string;
  let convexDeployKey: string;

  try {
    ({
      CLERK_WEBHOOK_SECRET: webhookSecret,
      NEXT_PUBLIC_CONVEX_URL: convexUrl,
      CONVEX_DEPLOY_KEY: convexDeployKey,
    } = requireEnv(
      "CLERK_WEBHOOK_SECRET",
      "NEXT_PUBLIC_CONVEX_URL",
      "CONVEX_DEPLOY_KEY"
    ));
  } catch (error) {
    console.error("Missing webhook configuration:", error);
    return new Response("Webhook configuration error", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, first_name, last_name, email_addresses } = event.data;
    const primaryEmail = email_addresses?.find((e) => e.id === event.data.primary_email_address_id);
    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";
    const convex = new ConvexHttpClient(convexUrl) as ConvexHttpClient & {
      setAdminAuth: (token: string) => void;
    };
    convex.setAdminAuth(convexDeployKey);

    // ConvexHttpClient.mutation types expect public refs; internal refs work at runtime with setAdminAuth
    await convex.mutation(
      internal.users.upsertUserFromWebhook as unknown as Parameters<
        ConvexHttpClient["mutation"]
      >[0],
      {
        clerkId: id,
        name,
        email: primaryEmail?.email_address,
      }
    );
  }

  return new Response("", { status: 200 });
}
