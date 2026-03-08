"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { SubmitPublicDuaResult } from "@/app/actions/duas";

type SubmitDuaCardClientProps = {
  submitDua: (formData: FormData) => Promise<SubmitPublicDuaResult>;
};

export function SubmitDuaCardClient({ submitDua }: SubmitDuaCardClientProps) {
  const { isSignedIn, user } = useUser();
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    "published" | "queued_for_review" | null
  >(null);
  const profileName = user?.fullName?.trim() || user?.firstName?.trim() || "your profile";
  const shouldShowGuestNameField = !isAnonymous && !isSignedIn;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    setError(null);
    setIsPending(true);
    setSubmissionStatus(null);

    try {
      const formData = new FormData();
      formData.set("text", text);
      formData.set("isAnonymous", String(isAnonymous));
      if (shouldShowGuestNameField && name.trim()) {
        formData.set("name", name.trim());
      }

      const result = await submitDua(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      setText("");
      setName("");
      setSubmissionStatus(result.status);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Something went wrong"
      );
    } finally {
      setIsPending(false);
    }
  }

  function handleCancel() {
    setText("");
    setName("");
    setError(null);
    setSubmissionStatus(null);
  }

  return (
    <div className="card-glass card-submit submit-section">
      <div>
        <h2>Share Your Dua</h2>
        <p className="submit-hint">
          Your dua will appear on the public wall for others to say Ameen. Guests
          get 1 post every 24 hours by IP. Signed-in users get up to 50 per hour and
          can use groups.
        </p>
      </div>

      <div
        className="submit-dropdown"
        role="region"
        aria-label="Submit your dua"
      >
        <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            className="submit-dropdown-form"
          >
              {shouldShowGuestNameField ? (
                <div>
                  <label htmlFor="card-dua-name" className="sr-only">
                    Your name
                  </label>
                  <input
                    id="card-dua-name"
                    name="name"
                    type="text"
                    placeholder="Your name…"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="form-input"
                    maxLength={100}
                    autoComplete="name"
                    required={shouldShowGuestNameField}
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="card-dua-text" className="sr-only">
                  Your dua
                </label>
                <textarea
                  id="card-dua-text"
                  name="text"
                  placeholder="Write your dua here…"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  required
                  rows={5}
                  className="form-input form-textarea submit-dropdown-textarea"
                  maxLength={2000}
                />
                <p className="submit-dropdown-counter">{text.length}/2,000</p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  borderRadius: "16px",
                  border: "1px solid var(--border-subtle)",
                  background: "rgba(255, 255, 255, 0.03)",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      Post Anonymously
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {isAnonymous
                        ? "Your name stays hidden on this dua."
                        : isSignedIn
                          ? `The public wall will show ${profileName}.`
                          : "The public wall will show the name you enter below."}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAnonymous}
                    aria-label="Post anonymously"
                    className="toggle-anonymous"
                    onClick={() => setIsAnonymous((currentValue) => !currentValue)}
                  >
                    <span aria-hidden="true" className="toggle-anonymous-thumb" />
                  </button>
                </div>
              </div>

              {error ? (
                <p className="text-error submit-dropdown-message" role="alert" aria-live="polite">
                  {error}
                </p>
              ) : null}

              {submissionStatus ? (
                <p
                  className="text-success submit-dropdown-message"
                  role="status"
                  aria-live="polite"
                >
                  {submissionStatus === "published"
                    ? "Dua submitted. Swipe to see it on the wall."
                    : "Thanks, your submission is under review before it appears on the wall."}
                </p>
              ) : null}

              <div className="submit-form-actions">
                <button
                  type="submit"
                  disabled={isPending || !text.trim()}
                  className="btn-primary"
                >
                  {isPending ? "Submitting…" : "Submit Dua"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
      </div>
    </div>
  );
}
