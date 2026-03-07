"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

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
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !code || !group) return;
    if (!isSignedIn) return;

    if (group && !joining) {
      setJoining(true);
      joinGroup({ inviteCode: code })
        .then((groupId) => {
          router.push(`/groups/${groupId}`);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to join");
          setJoining(false);
        });
    }
  }, [isLoaded, isSignedIn, code, group, joinGroup, router, joining]);

  if (!code) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <p className="text-red-400">Invalid invite link</p>
      </div>
    );
  }

  if (group === undefined) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <p className="text-emerald-300/70">Loading...</p>
      </div>
    );
  }

  if (group === null) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <p className="text-red-400">Invalid or expired invite code</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <p className="text-emerald-300/70">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center px-4">
        <h1 className="mb-4 text-2xl font-bold text-emerald-50">
          Join {group.name}
        </h1>
        <p className="mb-8 text-emerald-200/80 text-center max-w-md">
          Sign in to join this group and share duas with its members.
        </p>
        <SignInButton mode="modal" forceRedirectUrl={`/join/${code}`}>
          <button className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-amber-50 hover:bg-amber-500">
            Sign in to join
          </button>
        </SignInButton>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center px-4">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => router.push("/groups")}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-emerald-50 hover:bg-emerald-600"
        >
          Go to my groups
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
      <p className="text-emerald-300/70">Joining group...</p>
    </div>
  );
}
