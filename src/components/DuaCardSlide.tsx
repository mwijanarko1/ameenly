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

type DuaCardSlideProps = {
    dua: {
        _id: Id<"duas">;
        text: string;
        name?: string;
        authorName?: string;
        isAnonymous?: boolean;
        createdAt: number;
        ameen: number;
        hasCurrentUserSaidAmeen?: boolean;
    };
};

export function DuaCardSlide({ dua }: DuaCardSlideProps) {
    const { isSignedIn } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const sayAmeen = useMutation(api.duas.sayAmeen);
    const [isSubmittingAmeen, setIsSubmittingAmeen] = useState(false);
    const [ameenError, setAmeenError] = useState<string | null>(null);

    const displayName = getDuaDisplayName(dua);
    const signInHref = buildAuthHref(
        "/sign-in",
        buildReturnPath(pathname, searchParams.toString()),
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

    const hasSaidAmeen = dua.hasCurrentUserSaidAmeen;

    return (
        <article
            className="card-glass card-dua"
            aria-label={`Dua from ${displayName}`}
        >
            <div className="dua-author">
                <div>
                    <p className="dua-name">{displayName}</p>
                    <p className="dua-time">{formatTimeAgo(dua.createdAt)}</p>
                </div>
            </div>

            <div className="dua-body">
                <p className="dua-text">{dua.text}</p>
            </div>

            <div className="dua-cta">
                {isSignedIn ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            void handleSayAmeen();
                        }}
                        disabled={isSubmittingAmeen || hasSaidAmeen}
                        className={`btn-ameen${hasSaidAmeen ? " btn-ameen--said" : ""}`}
                    >
                        {hasSaidAmeen
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
                
                <p className="ameen-count-text">
                    {dua.ameen} {dua.ameen === 1 ? "Ameen" : "Ameens"}
                </p>

                {ameenError ? (
                    <p
                        className="text-error ameen-error"
                        role="alert"
                        aria-live="polite"
                    >
                        {ameenError}
                    </p>
                ) : null}
            </div>
        </article>
    );
}
