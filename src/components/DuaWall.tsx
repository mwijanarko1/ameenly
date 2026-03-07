"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { DuaCard } from "./DuaCard";

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
  const publicResult =
    props.mode === "public"
      ? usePaginatedQuery(
          api.duas.listPublicDuas,
          {},
          { initialNumItems: 10 }
        )
      : null;

  const groupResult =
    props.mode === "group"
      ? usePaginatedQuery(
          api.groupDuas.listGroupDuas,
          { groupId: props.groupId },
          { initialNumItems: 10 }
        )
      : null;

  const result = publicResult ?? groupResult;
  const duas = result?.results ?? [];
  const status = result?.status ?? "LoadingFirstPage";
  const loadMore = result?.loadMore ?? (() => {});

  if (duas.length === 0 && status === "LoadingFirstPage") {
    return (
      <div className="py-12 text-center text-emerald-300/70">
        Loading duas...
      </div>
    );
  }

  if (duas.length === 0) {
    return (
      <div className="py-12 text-center text-emerald-300/70">
        No duas yet. Be the first to add one.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {duas.map((dua) => (
        <DuaCard
          key={dua._id}
          dua={dua}
          canDelete={props.mode === "group" ? props.canDelete : false}
          onDelete={
            props.mode === "group" && props.onDeleteDua
              ? () => props.onDeleteDua!(dua._id)
              : undefined
          }
        />
      ))}
      {status === "CanLoadMore" && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => loadMore(10)}
            className="rounded-lg bg-emerald-700/80 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600/90 transition-colors"
          >
            Load more
          </button>
        </div>
      )}
      {status === "LoadingMore" && (
        <div className="py-4 text-center text-emerald-300/70 text-sm">
          Loading...
        </div>
      )}
    </div>
  );
}
