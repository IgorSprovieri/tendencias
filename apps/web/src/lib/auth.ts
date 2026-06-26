import { ApiError } from "./api";

export type User = {
  id: number;
  name: string;
  email: string;
  github_user: string;
};

export type AuthResponse = {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type SessionResponse = {
  user: User;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  github_user: string;
};

export type UpdateUserInput = {
  name: string;
  github_user: string;
};

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

async function authFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function login(input: LoginInput) {
  return authFetch<SessionResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function register(input: RegisterInput) {
  return authFetch<SessionResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return authFetch<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export function updateUser(input: UpdateUserInput) {
  return authFetch<SessionResponse>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
