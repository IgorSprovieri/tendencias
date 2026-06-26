export const GUEST_ONLY_PATHS = ["/login", "/register"];

export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATHS.includes(pathname);
}

export function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth/")) {
    return false;
  }

  if (isGuestOnlyPath(pathname)) {
    return false;
  }

  if (pathname === "/recovery") {
    return false;
  }

  return true;
}
