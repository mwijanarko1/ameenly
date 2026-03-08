"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { SwipeCardDeck } from "@/components/SwipeCardDeck";
import { DuaCardSlide } from "@/components/DuaCardSlide";
import { SubmitDuaCard } from "@/components/SubmitDuaCard";

function HeroCard() {
    return (
        <div className="card-glass card-hero">
            <p className="bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <h1 className="brand">
                Ameen<span className="brand-accent">ly</span>
            </h1>
            <p className="tagline">
                Share duas. Make duas for others. The fasting person&apos;s dua
                isn&apos;t rejected.
            </p>
            <p className="subtitle">
                Swipe through the public dua wall and say Ameen. Or submit your own dua
                for others to pray for.
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

export function DuaDeck() {
    const result = usePaginatedQuery(
        api.duas.listPublicDuas,
        {},
        { initialNumItems: 20 }
    );

    const duas = result.results;
    const canLoadMore = result.status === "CanLoadMore";

    const cards = [
        <HeroCard key="hero" />,
        <SubmitDuaCard key="submit" />,
        ...duas.map((dua) => <DuaCardSlide key={dua._id} dua={dua} />),
    ];

    function handleCardChange(index: number) {
        /* Load more when nearing the end of the deck */
        if (index >= cards.length - 3 && canLoadMore) {
            result.loadMore(10);
        }
    }

    return (
        <SwipeCardDeck onCardChange={handleCardChange}>
            {cards}
        </SwipeCardDeck>
    );
}
