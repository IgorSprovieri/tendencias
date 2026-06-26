import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_HEADER,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "@/lib/auth-cookies";
import { isGuestOnlyPath, isProtectedPath } from "@/lib/auth-routes";
import { isJwtExpired } from "@/lib/jwt";
import { fetchRefreshTokens } from "@/lib/refresh-tokens";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname) && !isGuestOnlyPath(pathname)) {
    return NextResponse.next();
  }

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
  let refreshedTokens: Awaited<ReturnType<typeof fetchRefreshTokens>> = null;

  const shouldRefresh =
    !!refreshToken && (!accessToken || isJwtExpired(accessToken));

  if (shouldRefresh) {
    refreshedTokens = await fetchRefreshTokens(refreshToken);
    accessToken = refreshedTokens?.access_token ?? null;
  }

  const isAuthenticated = !!accessToken && !isJwtExpired(accessToken);

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearAuthCookies(response);
    return response;
  }

  if (isGuestOnlyPath(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let response = NextResponse.next();

  if (refreshedTokens) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(ACCESS_TOKEN_HEADER, refreshedTokens.access_token);

    response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    setAuthCookies(response, {
      access_token: refreshedTokens.access_token,
      refresh_token: refreshedTokens.refresh_token,
      expires_in: refreshedTokens.expires_in,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
