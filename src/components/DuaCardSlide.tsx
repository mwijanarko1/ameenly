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
import { sanitizeErrorMessage } from "@/lib/errorMessage";
import { ReportModal } from "@/components/ReportModal";
import type { ReportReason } from "@/lib/reportReasons";

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
        hasCurrentUserReported?: boolean;
    };
    canReport?: boolean;
};

export function DuaCardSlide({ dua, canReport }: DuaCardSlideProps) {
    const { isSignedIn } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const sayAmeen = useMutation(api.duas.sayAmeen);
    const reportDua = useMutation(api.duas.reportDua);
    const [isSubmittingAmeen, setIsSubmittingAmeen] = useState(false);
    const [ameenError, setAmeenError] = useState<string | null>(null);
    const [isReporting, setIsReporting] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);

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
            setAmeenError(sanitizeErrorMessage(error, "Could not say Ameen."));
        } finally {
            setIsSubmittingAmeen(false);
        }
    }

    async function handleReportSubmit(reason: ReportReason) {
        try {
            setReportError(null);
            setIsReporting(true);
            await reportDua({ duaId: dua._id, reason });
            setShowReportModal(false);
        } catch (error) {
            const msg = sanitizeErrorMessage(error, "Could not report dua.");
            setReportError(
                msg.toLowerCase().includes("already reported")
                    ? "You've already reported this dua."
                    : msg
            );
        } finally {
            setIsReporting(false);
        }
    }

    const hasSaidAmeen = dua.hasCurrentUserSaidAmeen;

    return (
        <article
            className="card-glass card-dua"
            aria-label={displayName ? `Dua from ${displayName}` : "Dua"}
        >
            <div className="dua-author">
                <div>
                    {displayName ? (
                        <p className="dua-name">{displayName}</p>
                    ) : null}
                    {displayName ? (
                        <p className="dua-time">{formatTimeAgo(dua.createdAt)}</p>
                    ) : null}
                </div>
                {canReport &&
                    !dua.hasCurrentUserReported &&
                    (isSignedIn ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowReportModal(true);
                            }}
                            disabled={isReporting}
                            className="dua-report-btn"
                            aria-label="Report dua"
                        >
                            Report
                        </button>
                    ) : (
                        <Link
                            href={signInHref}
                            className="dua-report-btn"
                            aria-label="Sign in to report dua"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Report
                        </Link>
                    ))}
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

                {(ameenError || reportError) ? (
                    <p
                        className="text-error ameen-error"
                        role="alert"
                        aria-live="polite"
                    >
                        {ameenError ?? reportError}
                    </p>
                ) : null}
            </div>
            <ReportModal
                isOpen={showReportModal}
                onClose={() => {
                    setShowReportModal(false);
                    setReportError(null);
                }}
                onSubmit={handleReportSubmit}
                isSubmitting={isReporting}
                error={reportError}
            />
        </article>
    );
}
