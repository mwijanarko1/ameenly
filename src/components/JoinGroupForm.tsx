"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeInviteCode } from "@/lib/inviteCodes";

type JoinGroupFormProps = {
  submitLabel?: string;
  initialValue?: string;
  hint?: string;
};

export function JoinGroupForm({
  submitLabel = "Review Invite",
  initialValue = "",
  hint = "Paste the full invite link or just the invite code.",
}: JoinGroupFormProps) {
  const inputId = useId();
  const router = useRouter();
  const [inviteValue, setInviteValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = normalizeInviteCode(inviteValue);

    if (!normalizedCode) {
      setError("Paste a valid invite link or code to continue.");
      return;
    }

    setError(null);
    router.push(`/join/${normalizedCode}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="join-form"
      noValidate
    >
      <div>
        <label htmlFor={inputId} className="join-form-label">
          Invite Link or Code
        </label>
        <input
          id={inputId}
          name="invite"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Paste a group link or invite code…"
          value={inviteValue}
          onChange={(event) => {
            setInviteValue(event.target.value);
            if (error) {
              setError(null);
            }
          }}
          className="form-input"
          aria-describedby={error ? `${inputId}-error` : `${inputId}-hint`}
        />
      </div>

      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>

      <p id={`${inputId}-hint`} className="join-form-hint">
        {hint}
      </p>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-error join-form-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
