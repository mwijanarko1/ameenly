import { describe, expect, it } from "vitest";
import {
  getModerationStatus,
  isVisibleOnPublicWall,
  moderateGuestSubmission,
} from "../../convex/lib/guestModeration";

describe("moderateGuestSubmission", () => {
  it("approves a clean dua", () => {
    expect(
      moderateGuestSubmission({
        text: "Please make things easy for my mother and grant her good health.",
        name: "Fatima",
      })
    ).toEqual({
      outcome: "approve",
      reasons: [],
    });
  });

  it("queues abusive or slur content", () => {
    const result = moderateGuestSubmission({
      text: "That person is a raghead.",
    });

    expect(result.outcome).toBe("review");
    expect(result.reasons).toContain("hate_or_slurs");
  });

  it("queues sexual content", () => {
    const result = moderateGuestSubmission({
      text: "Send nudes and porn links.",
    });

    expect(result.outcome).toBe("review");
    expect(result.reasons).toContain("sexual_content");
  });

  it("queues threats or violent intent", () => {
    const result = moderateGuestSubmission({
      text: "I want to kill them.",
    });

    expect(result.outcome).toBe("review");
    expect(result.reasons).toContain("threats_or_violence");
  });

  it("queues spam and off-platform contact attempts", () => {
    const result = moderateGuestSubmission({
      text: "Buy now and DM me on Telegram at foo@example.com.",
    });

    expect(result.outcome).toBe("review");
    expect(result.reasons).toEqual(
      expect.arrayContaining(["spam_or_promotion", "contact_or_solicitation"])
    );
  });

  it("can trigger review from the guest name alone", () => {
    const result = moderateGuestSubmission({
      text: "Please make dua for me.",
      name: "WhatsApp me",
    });

    expect(result.outcome).toBe("review");
    expect(result.reasons).toContain("contact_or_solicitation");
  });

  it("matches normalized casing and whitespace", () => {
    const result = moderateGuestSubmission({
      text: "  KiLL    them please  ",
    });

    expect(result.outcome).toBe("review");
    expect(result.reasons).toContain("threats_or_violence");
  });
});

describe("public wall visibility helpers", () => {
  it("treats missing moderation status as approved for legacy duas", () => {
    expect(getModerationStatus()).toBe("approved");
    expect(isVisibleOnPublicWall()).toBe(true);
  });

  it("hides pending and rejected content from the public wall", () => {
    expect(isVisibleOnPublicWall("pending_review")).toBe(false);
    expect(isVisibleOnPublicWall("rejected")).toBe(false);
  });
});
