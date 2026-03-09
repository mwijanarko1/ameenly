"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";

function formatReason(reason: string) {
  return reason
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

type TabId = "moderation" | "activity" | "public-duas" | "users";

export function AdminDashboard() {
  const { user } = useUser();
  const stats = useQuery(api.adminModeration.getAdminStats);
  const moderationQueue = useQuery(api.adminModeration.listPendingGuestDuas);
  const recentActivity = useQuery(api.adminModeration.listRecentActivity);
  const publicDuasResult = usePaginatedQuery(
    api.adminModeration.listAllPublicDuasForAdmin,
    {},
    { initialNumItems: 20 }
  );
  const usersResult = usePaginatedQuery(
    api.adminModeration.listAllUsers,
    {},
    { initialNumItems: 20 }
  );
  const approveGuestDua = useMutation(api.adminModeration.approveGuestDua);
  const rejectGuestDua = useMutation(api.adminModeration.rejectGuestDua);
  const updatePublicDua = useMutation(api.adminModeration.updatePublicDua);
  const deleteUserAndData = useAction(api.adminModeration.deleteUserAndData);

  const [activeTab, setActiveTab] = useState<TabId>("moderation");
  const [activeDuaId, setActiveDuaId] = useState<Id<"duas"> | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingDuaId, setEditingDuaId] = useState<Id<"duas"> | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<Id<"users"> | null>(null);
  const [deleteUserError, setDeleteUserError] = useState<string | null>(null);

  const authSource = stats ?? moderationQueue;
  const isAuthorized = authSource?.isAuthorized === true;
  const isLoading = stats === undefined && moderationQueue === undefined;

  function startEditingDua(duaId: Id<"duas">, currentText: string) {
    setEditingDuaId(duaId);
    setEditingText(currentText);
    setActionError(null);
  }

  function cancelEditingDua() {
    setEditingDuaId(null);
    setEditingText("");
    setActionError(null);
  }

  async function handleEditSave() {
    if (!editingDuaId) return;
    setActionError(null);
    try {
      await updatePublicDua({ duaId: editingDuaId, text: editingText });
      cancelEditingDua();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to update dua."
      );
    }
  }

  async function handleDeleteUser(userId: Id<"users">, clerkId: string, name: string) {
    if (
      !window.confirm(
        `Permanently delete "${name}" and all their data (duas, groups, ameens)? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleteUserError(null);
    setDeletingUserId(userId);
    try {
      await deleteUserAndData({ userId, clerkId });
    } catch (error) {
      setDeleteUserError(
        error instanceof Error ? error.message : "Failed to delete user."
      );
    } finally {
      setDeletingUserId(null);
    }
  }

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
        error instanceof Error
          ? error.message
          : "Unable to update moderation status."
      );
    } finally {
      setActiveDuaId(null);
    }
  }

  if (isLoading && !isAuthorized) {
    return (
      <main id="main-content" className="page-container">
        <div className="loading-screen">
          <p>Loading admin dashboard…</p>
        </div>
      </main>
    );
  }

  if (!isAuthorized) {
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
            Admin Dashboard
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
        {/* Header bar */}
        <div
          className="glass-panel"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ display: "grid", gap: "4px" }}>
            <Link
              href="/"
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              ← Back to Ameenly
            </Link>
            <h1 className="page-title" style={{ marginBottom: 0 }}>
              Admin Dashboard
            </h1>
            {user?.firstName && (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Signed in as {user.firstName}
              </p>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          <div className="glass-panel" style={{ padding: "16px" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
              Total Users
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "4px 0 0" }}>
              {stats?.totalUsers ?? "—"}
            </p>
          </div>
          <div className="glass-panel" style={{ padding: "16px" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
              Total Duas
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "4px 0 0" }}>
              {stats?.totalDuas ?? "—"}
            </p>
          </div>
          <div
            className="glass-panel"
            style={{
              padding: "16px",
              border:
                (stats?.pendingModerationCount ?? 0) > 0
                  ? "2px solid var(--color-accent)"
                  : undefined,
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
              Pending Review
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "4px 0 0" }}>
              {stats?.pendingModerationCount ?? "—"}
            </p>
          </div>
          <div className="glass-panel" style={{ padding: "16px" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
              Total Groups
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "4px 0 0" }}>
              {stats?.totalGroups ?? "—"}
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div
          role="tablist"
          aria-label="Admin sections"
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "moderation"}
            aria-controls="moderation-panel"
            id="moderation-tab"
            onClick={() => setActiveTab("moderation")}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "moderation"
                  ? "2px solid var(--btn-bg)"
                  : "2px solid transparent",
              color:
                activeTab === "moderation"
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === "moderation" ? 600 : 400,
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            Moderation
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "activity"}
            aria-controls="activity-panel"
            id="activity-tab"
            onClick={() => setActiveTab("activity")}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "activity"
                  ? "2px solid var(--btn-bg)"
                  : "2px solid transparent",
              color:
                activeTab === "activity"
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === "activity" ? 600 : 400,
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            Activity
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "public-duas"}
            aria-controls="public-duas-panel"
            id="public-duas-tab"
            onClick={() => setActiveTab("public-duas")}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "public-duas"
                  ? "2px solid var(--btn-bg)"
                  : "2px solid transparent",
              color:
                activeTab === "public-duas"
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === "public-duas" ? 600 : 400,
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            Public Duas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "users"}
            aria-controls="users-panel"
            id="users-tab"
            onClick={() => setActiveTab("users")}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "users"
                  ? "2px solid var(--btn-bg)"
                  : "2px solid transparent",
              color:
                activeTab === "users"
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === "users" ? 600 : 400,
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            Users
          </button>
        </div>

        {/* Moderation tab */}
        <div
          role="tabpanel"
          id="moderation-panel"
          aria-labelledby="moderation-tab"
          hidden={activeTab !== "moderation"}
          style={{ display: "grid", gap: "24px" }}
        >
          {actionError ? (
            <p className="text-error" role="alert" aria-live="polite">
              {actionError}
            </p>
          ) : null}

          {moderationQueue?.pendingDuas.length === 0 ? (
            <div className="glass-panel">
              <p style={{ color: "var(--text-secondary)" }}>
                No guest submissions are waiting for review.
              </p>
            </div>
          ) : (
            (moderationQueue?.pendingDuas ?? []).map((dua) => {
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
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>
                        {dua.isAnonymous
                          ? "Anonymous guest"
                          : dua.name ?? "Unnamed guest"}
                      </h3>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.85rem",
                        }}
                      >
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

        {/* Activity tab */}
        <div
          role="tabpanel"
          id="activity-panel"
          aria-labelledby="activity-tab"
          hidden={activeTab !== "activity"}
          style={{ display: "grid", gap: "16px" }}
        >
          {recentActivity === undefined ? (
            <div className="glass-panel">
              <p style={{ color: "var(--text-secondary)" }}>
                Loading activity…
              </p>
            </div>
          ) : recentActivity.activity.length === 0 ? (
            <div className="glass-panel">
              <p style={{ color: "var(--text-secondary)" }}>
                No moderation activity yet.
              </p>
            </div>
          ) : (
            recentActivity.activity.map((item) => (
              <article
                key={item._id}
                className="glass-panel"
                style={{ display: "grid", gap: "12px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      borderRadius: "999px",
                      padding: "4px 10px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background:
                        item.moderationStatus === "approved"
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                      color:
                        item.moderationStatus === "approved"
                          ? "var(--color-primary)"
                          : "var(--color-sign-out)",
                    }}
                  >
                    {item.moderationStatus === "approved"
                      ? "Approved"
                      : "Rejected"}
                  </span>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {new Date(item.moderatedAt).toLocaleString()}
                  </p>
                </div>
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    color: "var(--text-primary)",
                    margin: 0,
                    fontSize: "0.95rem",
                  }}
                >
                  {truncateText(item.text, 200)}
                </p>
                {(item.name || item.isAnonymous) && (
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {item.isAnonymous ? "Anonymous guest" : item.name}
                  </p>
                )}
              </article>
            ))
          )}
        </div>

        {/* Public Duas tab */}
        <div
          role="tabpanel"
          id="public-duas-panel"
          aria-labelledby="public-duas-tab"
          hidden={activeTab !== "public-duas"}
          style={{ display: "grid", gap: "16px" }}
        >
          {publicDuasResult.status === "LoadingFirstPage" ? (
            <div className="glass-panel">
              <p style={{ color: "var(--text-secondary)" }}>
                Loading public duas…
              </p>
            </div>
          ) : publicDuasResult.results.length === 0 ? (
            <div className="glass-panel">
              <p style={{ color: "var(--text-secondary)" }}>
                No public duas yet.
              </p>
            </div>
          ) : (
            <>
              {publicDuasResult.results.map((dua) => (
                <article
                  key={dua._id}
                  className="glass-panel"
                  style={{ display: "grid", gap: "12px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "grid", gap: "4px" }}>
                      <p
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        {dua.isGuest
                          ? dua.isAnonymous
                            ? "Anonymous guest"
                            : dua.name ?? "Unnamed guest"
                          : dua.isAnonymous
                            ? "Anonymous"
                            : dua.authorName ?? "User"}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.85rem",
                          margin: 0,
                        }}
                      >
                        {new Date(dua.createdAt).toLocaleString()}
                        {dua.isGuest ? " · Guest" : " · Signed in"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {dua.moderationStatus && (
                        <span
                          style={{
                            borderRadius: "999px",
                            padding: "4px 10px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background:
                              dua.moderationStatus === "approved"
                                ? "rgba(34, 197, 94, 0.15)"
                                : dua.moderationStatus === "pending_review"
                                  ? "rgba(234, 179, 8, 0.2)"
                                  : "rgba(239, 68, 68, 0.15)",
                            color:
                              dua.moderationStatus === "approved"
                                ? "var(--color-primary)"
                                : dua.moderationStatus === "pending_review"
                                  ? "var(--text-secondary)"
                                  : "var(--color-sign-out)",
                          }}
                        >
                          {dua.moderationStatus === "approved"
                            ? "Approved"
                            : dua.moderationStatus === "pending_review"
                              ? "Pending"
                              : "Rejected"}
                        </span>
                      )}
                      <span
                        style={{
                          display: "inline-block",
                          borderRadius: "999px",
                          border: "1px solid var(--border-subtle)",
                          padding: "4px 8px",
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          textAlign: "center",
                        }}
                      >
                        {dua.ameen} Ameen
                      </span>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                        onClick={() => startEditingDua(dua._id, dua.text)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  {editingDuaId === dua._id ? (
                    <div style={{ display: "grid", gap: "12px" }}>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={6}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-subtle)",
                          background: "var(--input-bg)",
                          color: "var(--text-primary)",
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                          resize: "vertical",
                        }}
                        aria-label="Edit dua text"
                      />
                      {actionError && (
                        <p className="text-error" role="alert">
                          {actionError}
                        </p>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={cancelEditingDua}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => void handleEditSave()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                        color: "var(--text-primary)",
                        margin: 0,
                        fontSize: "0.95rem",
                      }}
                    >
                      {dua.text}
                    </p>
                  )}
                  {editingDuaId !== dua._id && dua.moderationReasons &&
                    dua.moderationReasons.length > 0 && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {dua.moderationReasons.map((reason) => (
                          <span
                            key={reason}
                            style={{
                              borderRadius: "999px",
                              border: "1px solid var(--border-subtle)",
                              padding: "4px 8px",
                              fontSize: "0.7rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {formatReason(reason)}
                          </span>
                        ))}
                      </div>
                    )}
                </article>
              ))}
              {publicDuasResult.status === "CanLoadMore" && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => publicDuasResult.loadMore(20)}
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Users tab */}
        <div
          role="tabpanel"
          id="users-panel"
          aria-labelledby="users-tab"
          hidden={activeTab !== "users"}
          style={{ display: "grid", gap: "16px" }}
        >
          {deleteUserError ? (
            <p className="text-error" role="alert" aria-live="polite">
              {deleteUserError}
            </p>
          ) : null}
          {usersResult.status === "LoadingFirstPage" ? (
            <div className="glass-panel">
              <p style={{ color: "var(--text-secondary)" }}>
                Loading users…
              </p>
            </div>
          ) : usersResult.results.length === 0 ? (
            <div className="glass-panel">
              <p style={{ color: "var(--text-secondary)" }}>
                No users yet.
              </p>
            </div>
          ) : (
            <>
              {usersResult.results.map((u) => {
                const initial = (u.name || "?").charAt(0).toUpperCase();
                const isDeleting = deletingUserId === u._id;
                return (
                  <article
                    key={u._id}
                    className="glass-panel"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "var(--color-soft)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          flexShrink: 0,
                        }}
                      >
                        {initial}
                      </div>
                      <div style={{ display: "grid", gap: "2px", minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.name || "Unnamed"}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.85rem",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.email ?? "—"}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.75rem",
                            margin: 0,
                          }}
                        >
                          Joined {new Date(u._creationTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-sign-out"
                      disabled={isDeleting}
                      style={{ flexShrink: 0 }}
                      onClick={() =>
                        void handleDeleteUser(u._id, u.clerkId, u.name || "User")
                      }
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                  </article>
                );
              })}
              {usersResult.status === "CanLoadMore" && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => usersResult.loadMore(20)}
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
