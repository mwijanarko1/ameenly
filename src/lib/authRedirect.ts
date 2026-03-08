export function buildAuthHref(
  basePath: "/sign-in" | "/sign-up",
  redirectTo?: string
) {
  if (!redirectTo) {
    return basePath;
  }

  const params = new URLSearchParams({ redirect_url: redirectTo });
  return `${basePath}?${params.toString()}`;
}

export function buildReturnPath(pathname: string, search?: string) {
  if (!search) {
    return pathname;
  }

  return `${pathname}?${search}`;
}
