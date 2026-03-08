"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { submitPublicDua } from "@/app/actions/duas";

type SubmitDuaFormProps =
  | {
    mode: "public";
  }
  | {
    mode: "group";
    groupId: Id<"groups">;
  };

export function SubmitDuaForm(props: SubmitDuaFormProps) {
  const { isSignedIn, user } = useUser();
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submitGroupDua = useMutation(api.groupDuas.submitGroupDua);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "your profile";
  const shouldShowGuestNameField =
    props.mode === "public" && !isAnonymous && !isSignedIn;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (props.mode === "public") {
        const formData = new FormData();
        formData.set("text", text);
        formData.set("isAnonymous", String(isAnonymous));
        if (shouldShowGuestNameField && name.trim()) {
          formData.set("name", name.trim());
        }
        const result = await submitPublicDua(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
      } else {
        await submitGroupDua({
          groupId: props.groupId,
          text: text.trim(),
          isAnonymous,
        });
      }
      setText("");
      if (props.mode === "public") {
        setName("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {shouldShowGuestNameField && (
        <div>
          <label htmlFor="dua-name" className="sr-only">
            Your name
          </label>
          <input
            id="dua-name"
            name="name"
            type="text"
            placeholder="Your name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            maxLength={100}
            autoComplete="name"
            required={shouldShowGuestNameField}
          />
        </div>
      )}
      <div>
        <label htmlFor="dua-text" className="sr-only">
          Your dua
        </label>
        <textarea
          id="dua-text"
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
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {isAnonymous
                ? "Your name stays hidden on this dua."
                : props.mode === "group"
                  ? `Group members will see ${displayName}.`
                  : isSignedIn
                    ? `The public wall will show ${displayName}.`
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
      {error && (
        <p className="text-error" style={{ fontSize: "0.8rem" }} role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {props.mode === "public" ? (
        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          Public wall submissions are visible to anyone. Guests can post 1 dua
          every 24 hours by IP. Sign in to post up to 50 duas per hour and use
          groups.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !text.trim()}
        className="btn-primary"
      >
        {pending ? "Submitting…" : "Submit Dua"}
      </button>
    </form>
  );
}
