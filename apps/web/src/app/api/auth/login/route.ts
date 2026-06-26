import { proxyAuthRequest } from "@/lib/auth-server";

export async function POST(request: Request) {
  const body = await request.json();
  return proxyAuthRequest("/auth/login", body);
}
