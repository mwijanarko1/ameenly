"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { isSignedIn, isLoaded } = useAuth();
  const group = useQuery(
    api.groups.getGroupByInviteCode,
    code ? { inviteCode: code } : "skip"
  );
  const joinGroup = useMutation(api.groups.joinGroup);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedJoinRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !code || !group) return;
    if (!isSignedIn) return;
    if (hasAttemptedJoinRef.current) return;

    hasAttemptedJoinRef.current = true;

    void joinGroup({ inviteCode: code })
      .then((groupId) => {
        router.push(`/groups/${groupId}`);
      })
      .catch((err) => {
        hasAttemptedJoinRef.current = false;
        setError(err instanceof Error ? err.message : "Failed to join");
      });
  }, [isLoaded, isSignedIn, code, group, joinGroup, router]);

  if (!code) {
    return (
      <main id="main-content" className="loading-screen">
        <p className="text-error">Invalid invite link</p>
      </main>
    );
  }

  if (group === undefined) {
    return (
      <main id="main-content" className="loading-screen">
        <p>Loading…</p>
      </main>
    );
  }

  if (group === null) {
    return (
      <main id="main-content" className="loading-screen">
        <p className="text-error">Invalid or expired invite code</p>
      </main>
    );
  }

  if (!isLoaded) {
    return (
      <main id="main-content" className="loading-screen">
        <p>Loading…</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main
        id="main-content"
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <h1 className="page-title" style={{ marginBottom: "16px" }}>
          Join {group.name}
        </h1>
        <p
          style={{
            marginBottom: "32px",
            color: "var(--text-secondary)",
            textAlign: "center",
            maxWidth: "480px",
          }}
        >
          Sign in to join this group and share duas with its members.
        </p>
        <SignInButton mode="modal" forceRedirectUrl={`/join/${code}`}>
          <button type="button" className="btn-ameen" style={{ padding: "14px 28px" }}>
            Sign In to Join
          </button>
        </SignInButton>
      </main>
    );
  }

  if (error) {
    return (
      <main
        id="main-content"
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <p className="text-error" style={{ marginBottom: "16px" }}>
          {error}
        </p>
        <button
          type="button"
          onClick={() => router.push("/groups")}
          className="btn-ameen"
        >
          Go to My Groups
        </button>
      </main>
    );
  }

  return (
    <main id="main-content" className="loading-screen">
      <p>Joining group…</p>
    </main>
  );
}
