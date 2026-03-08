export const moderationReasons = [
  "hate_or_slurs",
  "sexual_content",
  "threats_or_violence",
  "harassment_or_abuse",
  "spam_or_promotion",
  "contact_or_solicitation",
  "privacy_leakage",
] as const;

export const moderationStatuses = [
  "approved",
  "pending_review",
  "rejected",
] as const;

export type ModerationReason = (typeof moderationReasons)[number];
export type ModerationStatus = (typeof moderationStatuses)[number];

export type GuestModerationDecision = {
  outcome: "approve" | "review";
  reasons: ModerationReason[];
};

type ModerationInput = {
  text: string;
  name?: string;
};

type ReasonRule = {
  reason: ModerationReason;
  patterns: RegExp[];
};

const reasonRules: ReasonRule[] = [
  {
    reason: "hate_or_slurs",
    patterns: [
      /\b(?:nigger|faggot|kike|chink|spic|raghead)\b/i,
      /\b(?:dirty\s+muslim|sand\s+nigger)\b/i,
    ],
  },
  {
    reason: "sexual_content",
    patterns: [
      /\b(?:fuck(?:ing)?|porn|nudes?|naked|horny|sex(?:ual)?|boobs?|penis|vagina)\b/i,
      /\b(?:blowjob|handjob|onlyfans)\b/i,
    ],
  },
  {
    reason: "threats_or_violence",
    patterns: [
      /\b(?:kill|murder|shoot|stab|bomb|slaughter|suicide|rape)\b/i,
      /\b(?:hurt|beat)\s+(?:him|her|them|you)\b/i,
    ],
  },
  {
    reason: "harassment_or_abuse",
    patterns: [
      /\b(?:bitch|whore|slut|piece\s+of\s+shit)\b/i,
      /\b(?:idiot|moron|loser|stupid)\b/i,
      /\b(?:hate\s+you|shut\s+up)\b/i,
    ],
  },
  {
    reason: "spam_or_promotion",
    patterns: [
      /\b(?:buy\s+now|limited\s+time|promo\s+code|discount|sale|subscribe)\b/i,
      /\b(?:crypto|bitcoin|forex|casino|betting|loan)\b/i,
      /https?:\/\//i,
      /\bwww\./i,
    ],
  },
  {
    reason: "contact_or_solicitation",
    patterns: [
      /\b(?:whatsapp|telegram|signal|snapchat|instagram|discord)\b/i,
      /\b(?:dm|text|call|message)\s+me\b/i,
      /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
      /\b(?:\+?\d[\d\s().-]{7,}\d)\b/i,
    ],
  },
  {
    reason: "privacy_leakage",
    patterns: [
      /\b(?:my|his|her|their)\s+(?:address|phone\s*number|email|ssn|social\s+security|passport|credit\s+card|bank\s+account)\b/i,
      /\b\d{3}-\d{2}-\d{4}\b/,
      /\b(?:address\s+is|lives\s+at)\b/i,
    ],
  },
];

function normalizeForMatching(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function collectReasons(input: ModerationInput) {
  const values = [input.text, input.name ?? ""]
    .map((value) => normalizeForMatching(value))
    .filter(Boolean);
  const haystack = values.join(" ");
  const reasons = new Set<ModerationReason>();

  for (const rule of reasonRules) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      reasons.add(rule.reason);
    }
  }

  return [...reasons];
}

export function moderateGuestSubmission(input: ModerationInput): GuestModerationDecision {
  const reasons = collectReasons(input);

  return reasons.length > 0
    ? { outcome: "review", reasons }
    : { outcome: "approve", reasons: [] };
}

export function getModerationStatus(status?: ModerationStatus) {
  return status ?? "approved";
}

export function isVisibleOnPublicWall(status?: ModerationStatus) {
  return getModerationStatus(status) === "approved";
}
