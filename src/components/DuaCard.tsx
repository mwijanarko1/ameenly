"use client";

import { useState } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(ts));
}

type PublicDua = {
  _id: Id<"duas">;
  text: string;
  name?: string;
  createdAt: number;
  ameen: number;
  hasCurrentUserSaidAmeen?: boolean;
};

type GroupDua = PublicDua & {
  authorName?: string;
};

type DuaCardProps = {
  dua: PublicDua | GroupDua;
  onDelete?: () => void;
  canDelete?: boolean;
};

export function DuaCard({ dua, onDelete, canDelete }: DuaCardProps) {
  const { isSignedIn } = useAuth();
  const sayAmeen = useMutation(api.duas.sayAmeen);
  const [isSubmittingAmeen, setIsSubmittingAmeen] = useState(false);
  const [ameenError, setAmeenError] = useState<string | null>(null);
  const displayName =
    "authorName" in dua && dua.authorName
      ? dua.authorName
      : dua.name?.trim() || "Anonymous";

  async function handleSayAmeen() {
    try {
      setAmeenError(null);
      setIsSubmittingAmeen(true);
      await sayAmeen({ duaId: dua._id });
    } catch (error) {
      setAmeenError(
        error instanceof Error ? error.message : "Could not say Ameen."
      );
    } finally {
      setIsSubmittingAmeen(false);
    }
  }

  return (
    <article
      className="glass-panel"
      style={{ padding: "20px 24px" }}
      aria-label={`Dua from ${displayName}`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-accent)" }}>
            {displayName}
          </p>
          <p
            style={{
              marginTop: "8px",
              whiteSpace: "pre-wrap",
              color: "var(--text-primary)",
              lineHeight: 1.6,
            }}
          >
            {dua.text}
          </p>
          <p
            style={{
              marginTop: "8px",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            {formatTimeAgo(dua.createdAt)}
          </p>
        </div>
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            style={{
              flexShrink: 0,
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "0.75rem",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            className="text-error"
            aria-label="Delete dua"
          >
            Delete
          </button>
        )}
      </div>
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {isSignedIn ? (
          <button
            type="button"
            onClick={() => {
              void handleSayAmeen();
            }}
            disabled={isSubmittingAmeen || dua.hasCurrentUserSaidAmeen}
            className="btn-ameen"
          >
            {dua.hasCurrentUserSaidAmeen
              ? "Ameen"
              : isSubmittingAmeen
                ? "Saying Ameen…"
                : "Say Ameen"}
          </button>
        ) : (
          <SignInButton mode="modal">
            <button type="button" className="btn-ameen">
              Say Ameen
            </button>
          </SignInButton>
        )}
        <span className="ameen-count">
          {dua.ameen} {dua.ameen === 1 ? "Ameen" : "Ameens"}
        </span>
      </div>
      {ameenError ? (
        <p
          className="text-error"
          style={{ marginTop: "8px", fontSize: "0.8rem" }}
          role="alert"
          aria-live="polite"
        >
          {ameenError}
        </p>
      ) : null}
    </article>
  );
}
