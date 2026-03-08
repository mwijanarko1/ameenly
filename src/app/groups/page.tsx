"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import Link from "next/link";

export default function GroupsPage() {
  const groups = useQuery(api.groups.getMyGroups);

  return (
    <main id="main-content" className="page-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <h1 className="page-title">My Groups</h1>
        <Link href="/groups/new" className="btn-ameen" style={{ textDecoration: "none" }}>
          + Create Group
        </Link>
      </div>

      {groups === undefined ? (
        <div className="loading-screen" style={{ minHeight: "30vh" }}>
          <p>Loading…</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <p>You haven&apos;t joined any groups yet.</p>
          <Link
            href="/groups/new"
            className="btn-ameen"
            style={{ display: "inline-block", textDecoration: "none" }}
          >
            Create Your First Group
          </Link>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group: Doc<"groups"> | null) =>
            group ? (
              <Link
                key={group._id}
                href={`/groups/${group._id}`}
                className="group-card"
              >
                <h3
                  style={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontSize: "1.05rem",
                  }}
                >
                  {group.name}
                </h3>
                {group.description && (
                  <p
                    style={{
                      marginTop: "6px",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {group.description}
                  </p>
                )}
                <p
                  style={{
                    marginTop: "12px",
                    fontSize: "0.75rem",
                    color: "var(--text-accent)",
                  }}
                >
                  View duas →
                </p>
              </Link>
            ) : null
          )}
        </div>
      )}
    </main>
  );
}
