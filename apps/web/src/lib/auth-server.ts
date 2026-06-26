import { NextResponse } from "next/server";
import { setAuthCookies } from "./auth-cookies";
import type { AuthResponse } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
    };

    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }

    if (typeof body.message === "string") {
      return body.message;
    }
  } catch {
    // ignore JSON parse errors
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function proxyAuthRequest(
  path: string,
  body: unknown,
): Promise<NextResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    return NextResponse.json({ message }, { status: response.status });
  }

  const data = (await response.json()) as AuthResponse;
  const jsonResponse = NextResponse.json({ user: data.user });

  setAuthCookies(jsonResponse, {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  });

  return jsonResponse;
}
