"use client";

import { useState } from "react";
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
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submitGroupDua = useMutation(api.groupDuas.submitGroupDua);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (props.mode === "public") {
        const formData = new FormData();
        formData.set("text", text);
        if (name.trim()) formData.set("name", name.trim());
        const result = await submitPublicDua(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
      } else {
        await submitGroupDua({
          groupId: props.groupId,
          text: text.trim(),
        });
      }
      setText("");
      if (props.mode === "public") setName("");
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
      {props.mode === "public" && (
        <div>
          <label htmlFor="dua-name" className="sr-only">
            Your name (optional)
          </label>
          <input
            id="dua-name"
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
