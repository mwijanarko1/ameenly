const INVITE_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

function sanitizeInviteCode(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue || !INVITE_CODE_PATTERN.test(trimmedValue)) {
    return null;
  }

  return trimmedValue;
}

export function normalizeInviteCode(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const inviteMatch = trimmedValue.match(/(?:^|\/)join\/([^/?#]+)/i);

  if (inviteMatch?.[1]) {
    return sanitizeInviteCode(decodeURIComponent(inviteMatch[1]));
  }

  return sanitizeInviteCode(trimmedValue);
}
