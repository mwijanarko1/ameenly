"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { DuaCard } from "@/components/DuaCard";

type DuaWallProps =
  | {
    mode: "public";
  }
  | {
    mode: "group";
    groupId: Id<"groups">;
    canDelete?: boolean;
    onDeleteDua?: (duaId: Id<"duas">) => void;
  };

export function DuaWall(props: DuaWallProps) {
  if (props.mode === "public") {
    return <PublicDuaWall />;
  }

  return (
    <GroupDuaWall
      groupId={props.groupId}
      canDelete={props.canDelete}
      onDeleteDua={props.onDeleteDua}
    />
  );
}

function PublicDuaWall() {
  const result = usePaginatedQuery(api.duas.listPublicDuas, {}, { initialNumItems: 10 });

  return <DuaWallContent duas={result.results} status={result.status} loadMore={result.loadMore} />;
}

type GroupDuaWallProps = {
  groupId: Id<"groups">;
  canDelete?: boolean;
  onDeleteDua?: (duaId: Id<"duas">) => void;
};

function GroupDuaWall({ groupId, canDelete, onDeleteDua }: GroupDuaWallProps) {
  const result = usePaginatedQuery(
    api.groupDuas.listGroupDuas,
    { groupId },
    { initialNumItems: 10 }
  );

  if (!result.results.length && result.status === "LoadingFirstPage") {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-secondary)" }}>
        Loading duas…
      </div>
    );
  }

  return (
    <DuaWallContent
      duas={result.results}
      status={result.status}
      loadMore={result.loadMore}
      canDelete={canDelete}
      onDeleteDua={onDeleteDua}
    />
  );
}

type DuaWallContentProps = {
  duas: Array<{
    _id: Id<"duas">;
    text: string;
    name?: string;
    authorName?: string;
    isAnonymous?: boolean;
    createdAt: number;
    ameen: number;
    hasCurrentUserSaidAmeen?: boolean;
  }>;
  status: "CanLoadMore" | "Exhausted" | "LoadingFirstPage" | "LoadingMore";
  loadMore: (numItems: number) => void;
  canDelete?: boolean;
  onDeleteDua?: (duaId: Id<"duas">) => void;
};

function DuaWallContent({
  duas,
  status,
  loadMore,
  canDelete,
  onDeleteDua,
}: DuaWallContentProps) {
  if (duas.length === 0 && status === "LoadingFirstPage") {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-secondary)" }}>
        Loading duas…
      </div>
    );
  }

  if (duas.length === 0) {
    return (
      <div className="empty-state">
        <p>No duas yet. Be the first to add one.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
      }}
    >
      {duas.map((dua) => (
        <DuaCard
          key={dua._id}
          dua={dua}
          canDelete={canDelete}
          onDelete={onDeleteDua ? () => onDeleteDua(dua._id) : undefined}
          canReport={canDelete === undefined}
        />
      ))}
      {status === "CanLoadMore" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "16px",
            width: "100%",
            maxWidth: "var(--standard-card-width)",
          }}
        >
          <button
            type="button"
            onClick={() => loadMore(10)}
            className="btn-ameen"
          >
            Load More
          </button>
        </div>
      )}
      {status === "LoadingMore" && (
        <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Loading…
        </div>
      )}
    </div>
  );
}
