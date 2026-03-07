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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="group-name" className="block text-sm font-medium text-emerald-200 mb-1">
          Group name
        </label>
        <input
          id="group-name"
          type="text"
          placeholder="e.g. Ahmed Family Duas"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-emerald-700/50 bg-emerald-950/50 px-4 py-2 text-emerald-50 placeholder-emerald-400/50 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          maxLength={100}
        />
      </div>
      <div>
        <label htmlFor="group-desc" className="block text-sm font-medium text-emerald-200 mb-1">
          Description (optional)
        </label>
        <textarea
          id="group-desc"
          placeholder="A private space for our family duas..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-emerald-700/50 bg-emerald-950/50 px-4 py-2 text-emerald-50 placeholder-emerald-400/50 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
          maxLength={300}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="w-full rounded-lg bg-amber-600 px-4 py-3 font-medium text-amber-50 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "Creating..." : "Create group"}
      </button>
    </form>
  );
}
