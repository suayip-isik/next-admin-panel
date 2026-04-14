export interface AvatarPresentationInput {
  email: string;
  fullName: string | null;
  avatarUrl: string | null | undefined;
  revision?: number | string | null;
}

export interface AvatarPresentation {
  src: string | null;
  fallback: string;
}

export function getUserInitials(email: string, fullName: string | null) {
  if (fullName) {
    const initials = fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

    if (initials) return initials;
  }

  return email.slice(0, 2).toUpperCase();
}

export function buildAvatarSrc(
  avatarUrl: string | null | undefined,
  revision: number | string | null | undefined,
) {
  if (!avatarUrl) return null;
  if (revision == null) return avatarUrl;

  const separator = avatarUrl.includes("?") ? "&" : "?";
  return `${avatarUrl}${separator}v=${encodeURIComponent(String(revision))}`;
}

export function getAvatarDisplayName(fileName: string | null) {
  return fileName?.trim() ? fileName : null;
}

export function getAvatarPresentation({
  email,
  fullName,
  avatarUrl,
  revision,
}: AvatarPresentationInput): AvatarPresentation {
  return {
    src: buildAvatarSrc(avatarUrl, revision),
    fallback: getUserInitials(email, fullName),
  };
}
