import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth-cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
