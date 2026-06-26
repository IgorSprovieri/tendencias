import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/session";

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

export async function PATCH(request: Request) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    return NextResponse.json({ message }, { status: response.status });
  }

  const user = await response.json();
  return NextResponse.json({ user });
}
