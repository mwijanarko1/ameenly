type DuaDisplayNameInput = {
  isAnonymous?: boolean;
  authorName?: string;
  name?: string;
};

export function getDuaDisplayName({
  isAnonymous,
  authorName,
  name,
}: DuaDisplayNameInput): string {
  if (isAnonymous) {
    return "Anonymous";
  }

  const trimmedAuthorName = authorName?.trim();
  if (trimmedAuthorName) {
    return trimmedAuthorName;
  }

  const trimmedName = name?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  return "Anonymous";
}
