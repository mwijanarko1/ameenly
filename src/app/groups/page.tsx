"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { GroupCard } from "@/components/GroupCard";
import { JoinGroupForm } from "@/components/JoinGroupForm";
import { buildAuthHref } from "@/lib/authRedirect";

type GroupSummary = {
  _id: Id<"groups">;
  _creationTime: number;
  name: string;
  description?: string;
  creatorId: Id<"users">;
  inviteCode: string;
  createdAt: number;
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function GroupsPage({ searchParams }: Props) {
  use(searchParams);
  const { isSignedIn, isLoaded } = useUser();
  const groups = useQuery(api.groups.getMyGroups) as GroupSummary[] | undefined;

  return (
    <main id="main-content" className="page-container" style={{ position: "relative" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="page-title">My Groups</h1>
        <p className="section-copy">
          Join a private dua circle with an invite, or create one for your family and friends.
        </p>
      </div>

      <div className="group-actions-grid" style={{ marginBottom: "32px" }}>
        <section className="glass-panel action-card">
          <p className="section-eyebrow">Join With an Invite</p>
          <h2 className="section-title">Paste a Link or Code</h2>
          <p className="section-copy">
            Open the invite first so you can confirm the group before joining.
          </p>
          <JoinGroupForm />
        </section>

        <section className="glass-panel action-card">
          <p className="section-eyebrow">Start Your Own</p>
          <h2 className="section-title">Create a Private Group</h2>
          <p className="section-copy">
            Make one place for shared duas, updates, and support from the people you trust.
          </p>
          <Link
            href="/groups/new"
            className="btn-secondary action-link"
            style={{ textDecoration: "none" }}
          >
            Create Group
          </Link>
        </section>
      </div>

      {groups === undefined ? (
        <div className="loading-screen" style={{ minHeight: "30vh" }}>
          <p>Loading…</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <h2 className="section-title" style={{ marginBottom: "8px" }}>
            No Groups Yet
          </h2>
          <p>Your joined groups will show up here once you accept an invite or create one.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "16px" }}>
            <h2 className="section-title">Your Circles</h2>
            <p className="section-copy">Jump back into the groups you already belong to.</p>
          </div>
          <div className="groups-grid">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        </>
      )}

      {isLoaded && !isSignedIn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "color-mix(in srgb, var(--bg-deep) 60%, transparent)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 10,
            padding: "24px",
          }}
          aria-modal="true"
          role="dialog"
          aria-label="Sign in required"
        >
          <div
            className="glass-panel profile-auth-card"
            style={{ width: "100%", maxWidth: "360px" }}
          >
            <div className="profile-auth-icon" aria-hidden="true">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2
              className="page-title"
              style={{ textAlign: "center", marginBottom: "8px" }}
            >
              Join the Circle
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                textAlign: "center",
                maxWidth: "280px",
                margin: "0 auto 28px",
                lineHeight: 1.5,
              }}
            >
              Sign in to join private dua groups, create your own, and share duas with the people you trust.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
              }}
            >
              <Link
                href={buildAuthHref("/sign-in", "/groups")}
                className="btn-primary"
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                Sign In
              </Link>
              <Link
                href={buildAuthHref("/sign-up", "/groups")}
                className="btn-secondary"
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
