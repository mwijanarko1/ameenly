"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { buildAuthHref, buildReturnPath } from "@/lib/authRedirect";
import { getDuaDisplayName } from "@/lib/duaDisplay";

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
  authorName?: string;
  isAnonymous?: boolean;
  createdAt: number;
  ameen: number;
  hasCurrentUserSaidAmeen?: boolean;
};

type DuaCardProps = {
  dua: PublicDua;
  onDelete?: () => void;
  canDelete?: boolean;
};

export function DuaCard({ dua, onDelete, canDelete }: DuaCardProps) {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sayAmeen = useMutation(api.duas.sayAmeen);
  const [isSubmittingAmeen, setIsSubmittingAmeen] = useState(false);
  const [ameenError, setAmeenError] = useState<string | null>(null);
  const displayName = getDuaDisplayName(dua);
  const signInHref = buildAuthHref(
    "/sign-in",
    buildReturnPath(pathname, searchParams.toString())
  );

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
      className="glass-panel px-6 py-5"
      aria-label={displayName ? `Dua from ${displayName}` : "Dua"}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {displayName ? (
            <p className="text-[0.85rem] font-semibold text-[var(--text-accent)]">
              {displayName}
            </p>
          ) : null}
          <p className="mt-2 whitespace-pre-wrap leading-[1.6] text-[var(--text-primary)]">
            {dua.text}
          </p>
          <p className="mt-2 text-[0.75rem] text-[var(--text-secondary)]">
            {formatTimeAgo(dua.createdAt)}
          </p>
        </div>
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="dua-card-delete text-error"
            aria-label="Delete dua"
          >
            Delete
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2.5 border-t border-[var(--border-subtle)] pt-3">
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
          <Link href={signInHref} className="btn-ameen">
            Say Ameen
          </Link>
        )}
        <span className="ameen-count">
          {dua.ameen} {dua.ameen === 1 ? "Ameen" : "Ameens"}
        </span>
      </div>
      {ameenError ? (
        <p
          className="mt-2 text-[0.8rem] text-error"
          role="alert"
          aria-live="polite"
        >
          {ameenError}
        </p>
      ) : null}
    </article>
  );
}
