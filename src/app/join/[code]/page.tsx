"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { JoinGroupForm } from "@/components/JoinGroupForm";
import { buildAuthHref } from "@/lib/authRedirect";
import { sanitizeErrorMessage } from "@/lib/errorMessage";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function JoinPage({ params, searchParams }: Props) {
  const { code } = use(params);
  use(searchParams);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const invitePreview = useQuery(
    api.groups.getInvitePreview,
    code ? { inviteCode: code } : "skip"
  );
  const joinGroup = useMutation(api.groups.joinGroup);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  async function handleJoin() {
    setError(null);
    setIsJoining(true);

    try {
      await joinGroup({ inviteCode: code });
      router.push(`/groups/${code}`);
    } catch (err) {
      setError(sanitizeErrorMessage(err, "Failed to join this group."));
    } finally {
      setIsJoining(false);
    }
  }

  if (!code) {
    return (
      <main id="main-content" className="page-container join-page-shell">
        <section className="glass-panel join-card">
          <p className="text-error">Invalid invite link.</p>
          <JoinGroupForm submitLabel="Try Another Invite" />
        </section>
      </main>
    );
  }

  if (invitePreview === undefined || !isLoaded) {
    return (
      <main id="main-content" className="page-container join-page-shell">
        <section className="glass-panel join-card">
          <p className="section-eyebrow">Private Group Invite</p>
          <h1 className="page-title">Loading Invite…</h1>
          <p className="section-copy">
            Checking this link and preparing the group details for you.
          </p>
        </section>
      </main>
    );
  }

  if (invitePreview === null) {
    return (
      <main id="main-content" className="page-container join-page-shell">
        <section className="glass-panel join-card">
          <p className="section-eyebrow">Private Group Invite</p>
          <h1 className="page-title">Invite Not Found</h1>
          <p className="section-copy">
            This invite link is invalid or has expired. Paste a fresh link or code to continue.
          </p>
          <JoinGroupForm submitLabel="Review Another Invite" initialValue={code} />
          <Link href="/" className="top-bar-link">
            Back to the public wall
          </Link>
        </section>
      </main>
    );
  }

  const memberLabel = invitePreview.memberCount === 1 ? "member" : "members";

  return (
    <main id="main-content" className="page-container join-page-shell">
      <section className="glass-panel join-card">
        <p className="section-eyebrow">Private Group Invite</p>
        <h1 className="page-title">Join {invitePreview.groupName}</h1>
        <p className="section-copy">
          {invitePreview.description ??
            "You were invited to a private dua circle where members can share requests and support one another."}
        </p>

        <div className="invite-meta-row" aria-label="Invite details">
          <span className="invite-meta-pill">
            {invitePreview.memberCount} {memberLabel}
          </span>
          <span className="invite-meta-pill">Invite Code: {code}</span>
        </div>

        {invitePreview.isAlreadyMember ? (
          <div className="status-panel status-panel--success">
            <p className="status-title">You&apos;re Already In This Group</p>
            <p className="status-copy">
              Open the group to keep reading and sharing duas with everyone inside.
            </p>
          </div>
        ) : !isSignedIn ? (
          <div className="status-panel">
            <p className="status-title">Sign In to Continue</p>
            <p className="status-copy">
              Sign in first so the group can add you as a member.
            </p>
          </div>
        ) : (
          <div className="status-panel">
            <p className="status-title">Ready to Join</p>
            <p className="status-copy">
              You&apos;ll join as a member and can start posting right away.
            </p>
          </div>
        )}

        {error ? (
          <p className="text-error join-form-error" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}

        <div className="join-action-stack">
          {invitePreview.isAlreadyMember ? (
            <button
              type="button"
              onClick={() => router.push(`/groups/${code}`)}
              className="btn-ameen"
            >
              Open Group
            </button>
          ) : !isSignedIn ? (
            <Link
              href={buildAuthHref("/sign-in", `/join/${code}`)}
              className="btn-ameen"
              style={{ textDecoration: "none" }}
            >
              Sign In to Continue
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                void handleJoin();
              }}
              disabled={isJoining}
              className="btn-ameen"
            >
              {isJoining ? "Joining…" : "Join Group"}
            </button>
          )}

          <Link href="/groups" className="btn-secondary join-secondary-link">
            Go to My Groups
          </Link>
        </div>

        <div className="join-divider" aria-hidden="true" />

        <div>
          <h2 className="section-title" style={{ marginBottom: "8px" }}>
            Have a Different Invite?
          </h2>
          <p className="section-copy" style={{ marginBottom: "16px" }}>
            Paste another invite link or code to switch without leaving this screen.
          </p>
          <JoinGroupForm submitLabel="Review Another Invite" />
        </div>
      </section>
    </main>
  );
}
