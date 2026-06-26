export function isJwtExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload)) as { exp?: number };
    if (!decoded.exp) return true;

    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
