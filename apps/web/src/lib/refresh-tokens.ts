import type { AuthResponse } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchRefreshTokens(
  refreshToken: string,
): Promise<AuthResponse | null> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<AuthResponse>;
}
