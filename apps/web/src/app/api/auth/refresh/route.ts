import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "@/lib/auth-cookies";
import { fetchRefreshTokens } from "@/lib/refresh-tokens";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Sessão expirada" },
      { status: 401 },
    );
  }

  const tokens = await fetchRefreshTokens(refreshToken);

  if (!tokens) {
    const response = NextResponse.json(
      { message: "Sessão expirada" },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ user: tokens.user });
  setAuthCookies(response, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
  });

  return response;
}
