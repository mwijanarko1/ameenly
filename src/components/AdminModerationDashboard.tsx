"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";

function formatReason(reason: string) {
  return reason.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminModerationDashboard() {
  const moderationQueue = useQuery(api.adminModeration.listPendingGuestDuas);
  const approveGuestDua = useMutation(api.adminModeration.approveGuestDua);
  const rejectGuestDua = useMutation(api.adminModeration.rejectGuestDua);
  const [activeDuaId, setActiveDuaId] = useState<Id<"duas"> | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleModerationAction(
    duaId: Id<"duas">,
    action: "approve" | "reject"
  ) {
    setActionError(null);
    setActiveDuaId(duaId);

    try {
      if (action === "approve") {
        await approveGuestDua({ duaId });
      } else {
        await rejectGuestDua({ duaId });
      }
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to update moderation status."
      );
    } finally {
      setActiveDuaId(null);
    }
  }

  if (moderationQueue === undefined) {
    return (
      <main id="main-content" className="page-container">
        <div className="loading-screen">
          <p>Loading moderation queue…</p>
        </div>
      </main>
    );
  }

  if (!moderationQueue.isAuthorized) {
    return (
      <main id="main-content" className="page-container">
        <div
          className="glass-panel"
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "grid",
            gap: "12px",
          }}
        >
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Moderation Queue
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            This page is limited to site admins in the moderation database.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="page-container">
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
        }}
      >
        <div className="glass-panel" style={{ display: "grid", gap: "8px" }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Moderation Queue
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Review guest public-wall submissions flagged by the local moderation rules.
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Pending items: {moderationQueue.pendingDuas.length}
          </p>
          {actionError ? (
            <p className="text-error" role="alert" aria-live="polite">
              {actionError}
            </p>
          ) : null}
        </div>

        {moderationQueue.pendingDuas.length === 0 ? (
          <div className="glass-panel">
            <p style={{ color: "var(--text-secondary)" }}>
              No guest submissions are waiting for review.
            </p>
          </div>
        ) : (
          moderationQueue.pendingDuas.map((dua) => {
            const isPendingAction = activeDuaId === dua._id;

            return (
              <article
                key={dua._id}
                className="glass-panel"
                style={{ display: "grid", gap: "16px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "grid", gap: "6px" }}>
                    <h2 style={{ fontSize: "1.05rem", fontWeight: 600 }}>
                      {dua.isAnonymous ? "Anonymous guest" : dua.name ?? "Unnamed guest"}
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      Submitted {new Date(dua.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {dua.moderationReasons.map((reason) => (
                      <span
                        key={reason}
                        style={{
                          borderRadius: "999px",
                          border: "1px solid var(--border-subtle)",
                          padding: "6px 10px",
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {formatReason(reason)}
                      </span>
                    ))}
                  </div>
                </div>

                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.7,
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  {dua.text}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={isPendingAction}
                    onClick={() => {
                      void handleModerationAction(dua._id, "reject");
                    }}
                  >
                    {isPendingAction ? "Working…" : "Reject"}
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isPendingAction}
                    onClick={() => {
                      void handleModerationAction(dua._id, "approve");
                    }}
                  >
                    {isPendingAction ? "Working…" : "Approve"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
