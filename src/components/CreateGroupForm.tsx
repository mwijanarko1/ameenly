"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "convex/_generated/api";

export function CreateGroupForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const createGroup = useMutation(api.groups.createGroup);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const groupId = await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/groups/${groupId}`);
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
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <div>
        <label
          htmlFor="group-name"
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
            marginBottom: "6px",
          }}
        >
          Group name
        </label>
        <input
          id="group-name"
          name="name"
          type="text"
          placeholder="e.g. Ahmed Family Duas…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-input"
          maxLength={100}
          autoComplete="off"
        />
      </div>
      <div>
        <label
          htmlFor="group-desc"
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
            marginBottom: "6px",
          }}
        >
          Description (optional)
        </label>
        <textarea
          id="group-desc"
          name="description"
          placeholder="A private space for our family duas…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="form-input form-textarea"
          style={{ minHeight: "64px" }}
          maxLength={300}
          autoComplete="off"
        />
      </div>
      {error && (
        <p className="text-error" style={{ fontSize: "0.8rem" }} role="alert" aria-live="polite">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="btn-primary"
      >
        {pending ? "Creating…" : "Create Group"}
      </button>
    </form>
  );
}
