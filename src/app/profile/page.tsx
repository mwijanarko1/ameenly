"use client";

import Link from "next/link";
import { usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";

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

export default function ProfilePage() {
  const result = usePaginatedQuery(
    api.duas.listMyDuas,
    {},
    { initialNumItems: 10 }
  );

  const duas = result.results;

  return (
    <main id="main-content" className="page-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="page-title" style={{ marginBottom: "6px" }}>
            My Duas
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Review your public and group dua submissions in one place.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/" className="top-bar-link">
            Public Wall
          </Link>
          <Link href="/groups" className="top-bar-link">
            My Groups
          </Link>
        </div>
      </div>

      {duas.length === 0 && result.status === "LoadingFirstPage" ? (
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading your duas…</p>
        </div>
      ) : duas.length === 0 ? (
        <div className="empty-state">
          <p>You haven&apos;t submitted any duas yet.</p>
          <Link
            href="/"
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
            <div style={{ display: "flex", justifyContent: "center", paddingTop: "8px" }}>
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
    </main>
  );
}
