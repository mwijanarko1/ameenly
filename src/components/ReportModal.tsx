"use client";

import { useRef, useEffect } from "react";
import { REPORT_REASONS, type ReportReason } from "@/lib/reportReasons";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason) => void;
  isSubmitting?: boolean;
  error?: string | null;
};

export function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
}: ReportModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const reason = form.reason?.value as ReportReason | undefined;
    if (reason && REPORT_REASONS.some((r) => r.value === reason)) {
      onSubmit(reason);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className="report-modal"
      aria-labelledby="report-modal-title"
      aria-describedby="report-modal-desc"
    >
      <div className="report-modal-content">
        <h2 id="report-modal-title" className="report-modal-title">
          Report dua
        </h2>
        <p id="report-modal-desc" className="report-modal-desc">
          Why are you reporting this dua?
        </p>
        <form onSubmit={handleSubmit}>
          <fieldset className="report-modal-fieldset" disabled={isSubmitting}>
            <legend className="sr-only">Select a reason</legend>
            {REPORT_REASONS.map(({ value, label }) => (
              <label key={value} className="report-modal-option">
                <input
                  type="radio"
                  name="reason"
                  value={value}
                  required
                  className="report-modal-radio"
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          {error ? (
            <p className="report-modal-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="report-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Submit report"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
