"use client";

import { useState } from "react";
import { submitPublicDua } from "@/app/actions/duas";

export function SubmitDuaCard() {
    const [expanded, setExpanded] = useState(false);
    const [text, setText] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        e.stopPropagation();
        setError(null);
        setPending(true);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.set("text", text);
            if (name.trim()) formData.set("name", name.trim());
            const result = await submitPublicDua(formData);
            if (result.error) {
                setError(result.error);
                return;
            }
            setText("");
            setName("");
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="card-glass card-submit submit-section">
            <div>
                <h2>Share Your Dua</h2>
                <p className="submit-hint">
                    Your dua will appear on the public wall for others to say Ameen. Guests get 1 post every 24 hours by IP. Signed-in users get up to 50 per hour and can use groups.
                </p>
            </div>

            {!expanded ? (
                <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="btn-primary"
                >
                    Submit Dua
                </button>
            ) : (
                /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
                <form
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                    style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                    <div>
                        <label htmlFor="card-dua-name" className="sr-only">
                            Your name (optional)
                        </label>
                        <input
                            id="card-dua-name"
                            name="name"
                            type="text"
                            placeholder="Your name (optional)…"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            maxLength={100}
                            autoComplete="name"
                        />
                    </div>
                    <div>
                        <label htmlFor="card-dua-text" className="sr-only">
                            Your dua
                        </label>
                        <textarea
                            id="card-dua-text"
                            name="text"
                            placeholder="Write your dua here…"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                            rows={4}
                            className="form-input form-textarea"
                            maxLength={2000}
                        />
                        <p
                            style={{
                                marginTop: "4px",
                                fontSize: "0.7rem",
                                color: "var(--text-secondary)",
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {text.length}/2,000
                        </p>
                    </div>

                    {error && (
                        <p
                            className="text-error"
                            style={{ fontSize: "0.8rem" }}
                            role="alert"
                            aria-live="polite"
                        >
                            {error}
                        </p>
                    )}

                    {success && (
                        <p
                            className="text-success"
                            style={{ fontSize: "0.8rem" }}
                            role="status"
                            aria-live="polite"
                        >
                            ✓ Dua submitted. Swipe to see it on the wall.
                        </p>
                    )}

                    <div className="submit-form-actions">
                        <button
                            type="submit"
                            disabled={pending || !text.trim()}
                            className="btn-primary"
                        >
                            {pending ? "Submitting…" : "Submit Dua"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setExpanded(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
