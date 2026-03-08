"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { SwipeCardDeck } from "@/components/SwipeCardDeck";
import { DuaCardSlide } from "@/components/DuaCardSlide";

function HeroCard() {
  return (
    <div className="card-glass card-hero">
      <img src="/logo.png" alt="Ameenly" className="hero-logo" width={120} height={120} />
      <h1 className="brand">
        Ameen<span className="brand-accent">ly</span>
      </h1>
      <p className="tagline">Share duas. Make duas for others.</p>
      <p className="subtitle">
        Swipe through the public dua wall and say Ameen. Or submit your own dua for others to pray for.
      </p>
      <div className="swipe-hint">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        <span>Swipe to browse duas</span>
      </div>
    </div>
  );
}

type DuaDeckProps =
  | { mode: "public" }
  | {
      mode: "group";
      groupId: Id<"groups">;
    };

export function DuaDeck(props: DuaDeckProps) {
  const publicResult = usePaginatedQuery(
    api.duas.listPublicDuas,
    props.mode === "public" ? {} : "skip",
    { initialNumItems: 20 }
  );

  const groupResult = usePaginatedQuery(
    api.groupDuas.listGroupDuas,
    props.mode === "group" ? { groupId: props.groupId } : "skip",
    { initialNumItems: 20 }
  );

  const result = props.mode === "public" ? publicResult : groupResult;
  const duas = result.results;
  const canLoadMore = result.status === "CanLoadMore";

  const cards =
    props.mode === "public"
      ? [<HeroCard key="hero" />, ...duas.map((dua) => <DuaCardSlide key={dua._id} dua={dua} />)]
      : duas.map((dua) => <DuaCardSlide key={dua._id} dua={dua} />);

  function handleCardChange(index: number) {
    if (index >= cards.length - 3 && canLoadMore) {
      result.loadMore(10);
    }
  }

  return (
    <div className="dua-deck-wrapper">
      <SwipeCardDeck onCardChange={handleCardChange}>{cards}</SwipeCardDeck>
    </div>
  );
}
