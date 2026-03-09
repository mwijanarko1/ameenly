"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import {
  Show,
  UserButton,
  useClerk,
  useUser,
} from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { buildAuthHref } from "@/lib/authRedirect";
import { getDuaDisplayName } from "@/lib/duaDisplay";
import { LegalLinks } from "@/components/LegalLinks";

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

type ProfileDua = {
  _id: Id<"duas">;
  text: string;
  name?: string;
  isAnonymous?: boolean;
  groupId?: Id<"groups">;
  createdAt: number;
  ameen: number;
  visibility: "group" | "public";
  groupName?: string;
  hasCurrentUserSaidAmeen?: boolean;
};

type AmeenDua = {
  _id: Id<"duas">;
  text: string;
  name?: string;
  authorName?: string;
  isAnonymous?: boolean;
  groupId?: Id<"groups">;
  createdAt: number;
  ameen: number;
  visibility: "group" | "public";
  groupName?: string;
};

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
            <Link
              href={buildAuthHref("/sign-in", "/profile")}
              className="btn-primary"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              Sign In
            </Link>
            <Link
              href={buildAuthHref("/sign-up", "/profile")}
              className="btn-secondary"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* ── Legal ── */}
        <div className="profile-legal-section">
          <h2 className="profile-legal-heading">Legal</h2>
          <nav
            aria-label="Legal"
            style={{ display: "flex", flexDirection: "column", gap: "0" }}
          >
            <LegalLinks />
          </nav>
        </div>

      </div>
    </main>
  );
}

function SignedInProfile() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const deleteAccountMutation = useMutation(api.users.deleteAccount);
  const [activeTab, setActiveTab] = useState<"mine" | "ameen">("mine");
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const displayNameInputRef = useRef<HTMLInputElement>(null);
  const result = usePaginatedQuery(
    api.duas.listMyDuas,
    {},
    { initialNumItems: 10 }
  );
  const ameenResult = usePaginatedQuery(
    api.duas.listDuasUserSaidAmeenTo,
    {},
    { initialNumItems: 10 }
  );

  const duas = result.results as ProfileDua[];
  const ameenDuas = ameenResult.results as AmeenDua[];
  const { isAdmin } = useQuery(api.adminModeration.isSiteAdmin) ?? { isAdmin: false };

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "My Profile";

  const startEditingName = () => {
    setDraftName(
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || ""
    );
    setNameError(null);
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setDraftName("");
    setNameError(null);
  };

  useEffect(() => {
    if (isEditingName) {
      displayNameInputRef.current?.focus();
    }
  }, [isEditingName]);

  const saveDisplayName = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setNameError("Display name cannot be empty");
      return;
    }
    if (trimmed.length > 64) {
      setNameError("Display name must be 64 characters or less");
      return;
    }
    if (!user) return;
    setIsSavingName(true);
    setNameError(null);
    try {
      await user.update({ firstName: trimmed, lastName: "" });
      setIsEditingName(false);
      setDraftName("");
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccountMutation();
      const res = await fetch("/api/delete-account", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete account");
      }
      await signOut();
      router.push("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

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
          {isEditingName ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Display name"
                maxLength={64}
                disabled={isSavingName}
                ref={displayNameInputRef}
                aria-label="Display name"
                className="profile-name-input"
                style={{
                  padding: "8px 12px",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void saveDisplayName();
                  }
                  if (e.key === "Escape") cancelEditingName();
                }}
              />
              {nameError && (
                <p style={{ fontSize: "0.8rem", color: "var(--color-sign-out)" }}>
                  {nameError}
                </p>
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={saveDisplayName}
                  disabled={isSavingName}
                  className="btn-primary"
                  style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                >
                  {isSavingName ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditingName}
                  disabled={isSavingName}
                  className="btn-secondary"
                  style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <h1 className="page-title" style={{ margin: 0 }}>
                  {displayName}
                </h1>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="admin-badge"
                    title="Site admin"
                    aria-label="Go to admin dashboard"
                    style={{ textDecoration: "none" }}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={startEditingName}
                  aria-label="Edit display name"
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px",
                    transition: "color 0.15s, background 0.15s",
                  }}
                  className="profile-edit-name-btn"
                >
                  Edit
                </button>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                {user?.primaryEmailAddress?.emailAddress ?? ""}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Duas Tabs ── */}
      <div
        className="glass-panel"
        style={{ padding: 0, overflow: "hidden" }}
      >
        {/* Tab Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("mine")}
            style={{
              padding: "12px 16px",
              fontSize: "0.85rem",
              fontWeight: activeTab === "mine" ? 600 : 400,
              color: activeTab === "mine" ? "var(--text-accent)" : "var(--text-secondary)",
              background: "none",
              border: "none",
              borderBottom: activeTab === "mine" ? "2px solid var(--text-accent)" : "2px solid transparent",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
              marginBottom: "-1px",
            }}
          >
            My Duas
            {duas.length > 0 && (
              <span
                style={{
                  marginLeft: "6px",
                  fontSize: "0.75rem",
                  color: activeTab === "mine" ? "var(--text-accent)" : "var(--text-secondary)",
                  opacity: 0.7,
                }}
              >
                {duas.length}{result.status === "CanLoadMore" || result.status === "LoadingMore" ? "+" : ""}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ameen")}
            style={{
              padding: "12px 16px",
              fontSize: "0.85rem",
              fontWeight: activeTab === "ameen" ? 600 : 400,
              color: activeTab === "ameen" ? "var(--text-accent)" : "var(--text-secondary)",
              background: "none",
              border: "none",
              borderBottom: activeTab === "ameen" ? "2px solid var(--text-accent)" : "2px solid transparent",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
              marginBottom: "-1px",
            }}
          >
            Said Ameen
            {ameenDuas.length > 0 && (
              <span
                style={{
                  marginLeft: "6px",
                  fontSize: "0.75rem",
                  color: activeTab === "ameen" ? "var(--text-accent)" : "var(--text-secondary)",
                  opacity: 0.7,
                }}
              >
                {ameenDuas.length}{ameenResult.status === "CanLoadMore" || ameenResult.status === "LoadingMore" ? "+" : ""}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "mine" && (
          <>
            {duas.length === 0 && result.status === "LoadingFirstPage" ? (
              <p style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                Loading…
              </p>
            ) : duas.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
                  You haven&apos;t submitted any duas yet.
                </p>
                <Link href="/submit" className="btn-ameen" style={{ textDecoration: "none" }}>
                  Share Your First Dua
                </Link>
              </div>
            ) : (
              <>
                {duas.map((dua, i) => {
                  const locationLabel =
                    dua.visibility === "group"
                      ? dua.groupName ?? "Private Group"
                      : "Public Wall";
                  return (
                    <div
                      key={dua._id}
                      style={{
                        padding: "12px 16px",
                        borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-accent)" }}>
                          {locationLabel}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexShrink: 0,
                          }}
                        >
                          {dua.isAnonymous ? (
                            <span
                              style={{
                                fontSize: "0.68rem",
                                color: "var(--text-secondary)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "999px",
                                padding: "2px 8px",
                              }}
                            >
                              Anonymous
                            </span>
                          ) : null}
                          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                            {formatTimeAgo(dua.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-primary)",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {dua.text}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                        {dua.ameen} {dua.ameen === 1 ? "Ameen" : "Ameens"}
                      </p>
                    </div>
                  );
                })}
                {result.status === "CanLoadMore" && (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
                    <button type="button" onClick={() => result.loadMore(10)} className="btn-ameen">
                      Load More
                    </button>
                  </div>
                )}
                {result.status === "LoadingMore" && (
                  <p style={{ padding: "12px 16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    Loading…
                  </p>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "ameen" && (
          <>
            {ameenDuas.length === 0 && ameenResult.status === "LoadingFirstPage" ? (
              <p style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                Loading…
              </p>
            ) : ameenDuas.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
                  You haven&apos;t said Ameen to any duas yet.
                </p>
                <Link href="/" className="btn-ameen" style={{ textDecoration: "none" }}>
                  Browse Duas
                </Link>
              </div>
            ) : (
              <>
                {ameenDuas.map((dua, i) => {
                  const displayName = getDuaDisplayName(dua);
                  return (
                    <div
                      key={dua._id}
                      style={{
                        padding: "12px 16px",
                        borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                        {displayName ? (
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-accent)" }}>
                            {displayName}
                          </span>
                        ) : null}
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", flexShrink: 0 }}>
                          {formatTimeAgo(dua.createdAt)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-primary)",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {dua.text}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                        {dua.ameen} {dua.ameen === 1 ? "Ameen" : "Ameens"}
                      </p>
                    </div>
                  );
                })}
                {ameenResult.status === "CanLoadMore" && (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
                    <button type="button" onClick={() => ameenResult.loadMore(10)} className="btn-ameen">
                      Load More
                    </button>
                  </div>
                )}
                {ameenResult.status === "LoadingMore" && (
                  <p style={{ padding: "12px 16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    Loading…
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── Legal + Footer ── */}
      <div style={{ marginTop: "48px" }}>
        <div className="profile-legal-section">
          <h2 className="profile-legal-heading">Legal</h2>
          <nav
            aria-label="Legal"
            style={{ display: "flex", flexDirection: "column", gap: "0" }}
          >
            <LegalLinks />
          </nav>
        </div>
        <button
          type="button"
          onClick={() => {
            signOut().catch((err) => {
              console.error("Sign out failed:", err);
            });
          }}
          className="btn-sign-out"
        >
          Sign Out
        </button>
        {showDeleteConfirm ? (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
              background: "color-mix(in srgb, var(--color-sign-out) 8%, var(--bg-deep))",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                marginBottom: "12px",
                lineHeight: 1.5,
              }}
            >
              This will permanently delete your account, profile, groups you created, and anonymize your duas. This cannot be undone.
            </p>
            {deleteError && (
              <p style={{ fontSize: "0.8rem", color: "var(--color-sign-out)", marginBottom: "12px" }}>
                {deleteError}
              </p>
            )}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="btn-secondary"
                style={{ padding: "10px 16px", fontSize: "0.85rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  borderRadius: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  background: "var(--color-sign-out)",
                  color: "white",
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? "Deleting…" : "Yes, delete my account"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-delete-account"
          >
            Delete Account
          </button>
        )}
      </div>
    </main>
  );
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ProfilePage({ searchParams }: Props) {
  use(searchParams);
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
