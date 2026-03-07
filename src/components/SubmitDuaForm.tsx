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
    <form onSubmit={handleSubmit} className="space-y-3">
      {props.mode === "public" && (
        <div>
          <label htmlFor="dua-name" className="sr-only">
            Your name (optional)
          </label>
          <input
            id="dua-name"
            type="text"
            placeholder="Your name (optional, leave blank for anonymous)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-emerald-700/50 bg-emerald-950/50 px-4 py-2 text-emerald-50 placeholder-emerald-400/50 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            maxLength={100}
          />
        </div>
      )}
      <div>
        <label htmlFor="dua-text" className="sr-only">
          Your dua
        </label>
        <textarea
          id="dua-text"
          placeholder="Write your dua here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={4}
          className="w-full rounded-lg border border-emerald-700/50 bg-emerald-950/50 px-4 py-3 text-emerald-50 placeholder-emerald-400/50 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
          maxLength={2000}
        />
        <p className="mt-1 text-xs text-emerald-400/60">
          {text.length}/2000
        </p>
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !text.trim()}
        className="w-full rounded-lg bg-amber-600 px-4 py-3 font-medium text-amber-50 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "Submitting..." : "Submit dua"}
      </button>
    </form>
  );
}
