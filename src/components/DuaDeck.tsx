"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { SwipeCardDeck } from "@/components/SwipeCardDeck";
import { DuaCardSlide } from "@/components/DuaCardSlide";

function HeroCard() {
  return (
    <div className="card-glass card-hero card-standard-size">
      <Image
        src="/logo.png"
        alt="Ameenly — The Online Dua Wall"
        className="hero-logo"
        width={120}
        height={120}
        priority
      />
      <h1 className="brand">
        Ameen<span className="brand-accent">ly</span>
      </h1>
      <p className="tagline">Share duas. Make duas for others.</p>
      <p className="subtitle">
        Swipe through the public dua wall and say Ameen. Or submit your own dua for others to pray for.
      </p>
      <div className="swipe-hint">
        <span>Swipe left to go next and swipe right to go back</span>
      </div>
    </div>
  );
}

type DuaDeckProps =
  | { mode: "public" }
  | {
      mode: "group";
      groupId: Id<"groups">;
      onEmptySubmitClick?: () => void;
    };

export function DuaDeck(props: DuaDeckProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
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
  const loadMore = result.loadMore;
  const canLoadMore = result.status === "CanLoadMore";

  const isGroupEmpty = props.mode === "group" && duas.length === 0;

  const cards =
    props.mode === "public"
      ? [
          <HeroCard key="hero" />,
          ...duas.map((dua) => (
            <DuaCardSlide key={dua._id} dua={dua} canReport />
          )),
        ]
      : duas.map((dua) => <DuaCardSlide key={dua._id} dua={dua} />);

  useEffect(() => {
    if (!canLoadMore) {
      return;
    }

    if (currentCardIndex < Math.max(cards.length - 3, 0)) {
      return;
    }

    loadMore(10);
  }, [canLoadMore, cards.length, currentCardIndex, loadMore]);

  if (isGroupEmpty) {
    return (
      <div className="dua-deck-wrapper">
        <div
          className="glass-panel"
          style={{
            width: "100%",
            textAlign: "center",
            padding: "32px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: 0 }}>
            No duas yet.
          </p>
          {props.onEmptySubmitClick && (
            <button
              type="button"
              onClick={props.onEmptySubmitClick}
              className="nav-btn"
              style={{ padding: "12px 24px" }}
            >
              Submit a dua
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dua-deck-wrapper">
      <SwipeCardDeck onCardChange={setCurrentCardIndex}>{cards}</SwipeCardDeck>
    </div>
  );
}
