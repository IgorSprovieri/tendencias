import { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const ACCESS_TOKEN_HEADER = "x-access-token";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

type AuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
};

export function setAuthCookies(
  response: NextResponse,
  tokens: AuthTokens,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    ...baseCookieOptions,
    maxAge: tokens.expires_in ?? ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
}
