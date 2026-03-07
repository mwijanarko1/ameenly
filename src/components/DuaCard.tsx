"use client";

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
  return new Date(ts).toLocaleDateString();
}

type PublicDua = {
  _id: Id<"duas">;
  text: string;
  name?: string;
  createdAt: number;
  ameen: number;
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
  const sayAmeen = useMutation(api.duas.sayAmeen);
  const displayName =
    "authorName" in dua && dua.authorName
      ? dua.authorName
      : dua.name?.trim() || "Anonymous";

  return (
    <article
      className="rounded-xl border border-emerald-800/30 bg-emerald-950/30 p-4 sm:p-5 backdrop-blur"
      aria-label={`Dua from ${displayName}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-200/90">{displayName}</p>
          <p className="mt-2 whitespace-pre-wrap text-emerald-50/95 leading-relaxed">
            {dua.text}
          </p>
          <p className="mt-2 text-xs text-emerald-300/60">
            {formatTimeAgo(dua.createdAt)}
          </p>
        </div>
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300"
            aria-label="Delete dua"
          >
            Delete
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => sayAmeen({ duaId: dua._id })}
          className="rounded-lg bg-amber-600/80 px-3 py-1.5 text-sm font-medium text-amber-50 hover:bg-amber-500/90 transition-colors"
        >
          Say Ameen
        </button>
        <span className="text-sm text-amber-200/80">
          {dua.ameen} {dua.ameen === 1 ? "Ameen" : "Ameens"}
        </span>
      </div>
    </article>
  );
}
