import { cookies, headers } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_HEADER,
  REFRESH_TOKEN_COOKIE,
} from "./auth-cookies";
import { fetchRefreshTokens } from "./refresh-tokens";
import type { User } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchUser(accessToken: string): Promise<User | null> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<User>;
}

export async function getAccessToken(): Promise<string | null> {
  const headersList = await headers();
  const cookieStore = await cookies();

  const headerToken = headersList.get(ACCESS_TOKEN_HEADER);
  const cookieToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (headerToken) {
    return headerToken;
  }

  if (cookieToken) {
    return cookieToken;
  }

  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return null;
  }

  const tokens = await fetchRefreshTokens(refreshToken);
  return tokens?.access_token ?? null;
}

export async function getSession(): Promise<User | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const user = await fetchUser(accessToken);
  if (user) {
    return user;
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return null;
  }

  const tokens = await fetchRefreshTokens(refreshToken);
  if (!tokens) {
    return null;
  }

  return fetchUser(tokens.access_token);
}
