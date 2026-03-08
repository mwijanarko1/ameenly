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

function getInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase() || "?";
}

type DuaCardSlideProps = {
    dua: {
        _id: Id<"duas">;
        text: string;
        name?: string;
        authorName?: string;
        createdAt: number;
        ameen: number;
        hasCurrentUserSaidAmeen?: boolean;
    };
};

export function DuaCardSlide({ dua }: DuaCardSlideProps) {
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
            className="card-glass card-dua"
            aria-label={`Dua from ${displayName}`}
        >
            <div className="dua-author">
                <div className="dua-avatar" aria-hidden="true">
                    {getInitial(displayName)}
                </div>
                <div>
                    <p className="dua-name">{displayName}</p>
                    <p className="dua-time">{formatTimeAgo(dua.createdAt)}</p>
                </div>
            </div>

            <p className="dua-text">{dua.text}</p>

            <div className="dua-footer">
                {isSignedIn ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
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
                    style={{ fontSize: "0.8rem", marginTop: "8px" }}
                    role="alert"
                    aria-live="polite"
                >
                    {ameenError}
                </p>
            ) : null}
        </article>
    );
}
