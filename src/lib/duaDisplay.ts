type DuaDisplayNameInput = {
  isAnonymous?: boolean;
  isSeedDua?: boolean;
  authorName?: string;
  name?: string;
};

export function getDuaDisplayName({
  isAnonymous,
  isSeedDua,
  authorName,
  name,
}: DuaDisplayNameInput): string {
  if (isSeedDua) {
    return "";
  }

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
