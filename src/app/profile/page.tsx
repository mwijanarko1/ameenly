"use client";

import Link from "next/link";
import { usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

function formatTimeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

function SignedOutProfile() {
  return (
    <main
      id="main-content"
      className="page-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70dvh",
        paddingBottom: "120px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
        }}
      >
        {/* ── Auth Prompt ── */}
        <div className="glass-panel profile-auth-card">
          <div className="profile-auth-icon" aria-hidden="true">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
            </svg>
          </div>
          <h1
            className="page-title"
            style={{ textAlign: "center", marginBottom: "8px" }}
          >
            Welcome to Ameenly
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              textAlign: "center",
              maxWidth: "300px",
              margin: "0 auto 24px",
            }}
          >
            Sign in to track your duas, join private groups, and submit up to 50
            duas per hour.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <SignInButton mode="modal">
              <button type="button" className="btn-primary">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="btn-secondary">
                Create Account
              </button>
            </SignUpButton>
          </div>
        </div>

        {/* ── Legal ── */}
        <div className="profile-legal-section">
          <h2 className="profile-legal-heading">Legal</h2>
          <nav
            aria-label="Legal"
            style={{ display: "flex", flexDirection: "column", gap: "0" }}
          >
            <Link href="/privacy" className="profile-legal-link">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Privacy Policy</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ marginLeft: "auto", opacity: 0.4 }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
            <Link href="/terms" className="profile-legal-link">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
              <span>Terms of Use</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ marginLeft: "auto", opacity: 0.4 }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </nav>
        </div>

      </div>
    </main>
  );
}

function SignedInProfile() {
  const { user } = useUser();
  const result = usePaginatedQuery(
    api.duas.listMyDuas,
    {},
    { initialNumItems: 10 }
  );

  const duas = result.results;

  return (
    <main id="main-content" className="page-container" style={{ paddingBottom: "120px" }}>
      {/* ── Profile Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <UserButton
          appearance={{
            elements: { avatarBox: { width: 48, height: 48 } },
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="page-title" style={{ marginBottom: "4px" }}>
            {user?.firstName ?? "My Profile"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {user?.primaryEmailAddress?.emailAddress ?? ""}
          </p>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          className="btn-ameen"
          style={{ textDecoration: "none" }}
        >
          Public Wall
        </Link>
        <Link
          href="/groups"
          className="btn-ameen"
          style={{ textDecoration: "none" }}
        >
          My Groups
        </Link>
      </div>

      {/* ── My Duas ── */}
      <h2
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "16px",
        }}
      >
        My Duas
      </h2>

      {duas.length === 0 && result.status === "LoadingFirstPage" ? (
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading your duas…</p>
        </div>
      ) : duas.length === 0 ? (
        <div className="empty-state">
          <p>You haven&apos;t submitted any duas yet.</p>
          <Link
            href="/submit"
            className="btn-ameen"
            style={{ display: "inline-block", textDecoration: "none" }}
          >
            Share Your First Dua
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {duas.map((dua) => {
            const locationLabel =
              dua.visibility === "group"
                ? dua.groupName
                  ? `Group: ${dua.groupName}`
                  : "Private Group"
                : "Public Wall";
            const locationHref = dua.groupId ? `/groups/${dua.groupId}` : "/";
            const submittedAs =
              dua.visibility === "public" && dua.name
                ? `Posted publicly as ${dua.name}`
                : dua.visibility === "public"
                  ? "Posted publicly from your account"
                  : "Posted to one of your groups";

            return (
              <article key={dua._id} className="glass-panel">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text-accent)",
                        marginBottom: "4px",
                      }}
                    >
                      {locationLabel}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {submittedAs}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {formatTimeAgo(dua.createdAt)}
                  </p>
                </div>

                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    color: "var(--text-primary)",
                    lineHeight: 1.7,
                  }}
                >
                  {dua.text}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--border-subtle)",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {dua.ameen} {dua.ameen === 1 ? "Ameen" : "Ameens"}
                  </span>
                  <Link
                    href={locationHref}
                    className="top-bar-link"
                    style={{ textDecoration: "none" }}
                  >
                    View Context
                  </Link>
                </div>
              </article>
            );
          })}

          {result.status === "CanLoadMore" ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => result.loadMore(10)}
                className="btn-ameen"
              >
                Load More
              </button>
            </div>
          ) : null}

          {result.status === "LoadingMore" ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              Loading more…
            </p>
          ) : null}
        </div>
      )}

      {/* ── Legal + Footer ── */}
      <div style={{ marginTop: "48px" }}>
        <div className="profile-legal-section">
          <h2 className="profile-legal-heading">Legal</h2>
          <nav
            aria-label="Legal"
            style={{ display: "flex", flexDirection: "column", gap: "0" }}
          >
            <Link href="/privacy" className="profile-legal-link">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Privacy Policy</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ marginLeft: "auto", opacity: 0.4 }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
            <Link href="/terms" className="profile-legal-link">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
              <span>Terms of Use</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ marginLeft: "auto", opacity: 0.4 }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <>
      <Show when="signed-out">
        <SignedOutProfile />
      </Show>
      <Show when="signed-in">
        <SignedInProfile />
      </Show>
    </>
  );
}
