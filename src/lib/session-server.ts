import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base-url";
import type { SessionUser, TokenPair, WebSession } from "@/types/session";

export const SESSION_COOKIE = "rehi_session";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
} as const;

export type AuthCall =
  | { ok: true; pair: TokenPair }
  | { ok: false; status: number; body: unknown };

type AuthRequest = { body?: unknown; bearer?: string };

async function postRehiAuth(
  path: string,
  { body, bearer }: AuthRequest
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body: json };
  } catch (error) {
    console.error(`Rehi auth ${path} unreachable:`, error);
    return { ok: false, status: 502, body: null };
  }
}

export async function callRehiAuth(
  path: string,
  request: AuthRequest = {}
): Promise<AuthCall> {
  const res = await postRehiAuth(path, request);
  const pair = res.ok
    ? parseTokenPair((res.body as { data?: unknown } | null)?.data)
    : null;
  if (pair) return { ok: true, pair };
  return { ok: false, status: res.ok ? 502 : res.status, body: res.body };
}

export async function revokeRehiSession(refreshToken: string) {
  const res = await postRehiAuth("/auth/logout", { body: { refreshToken } });
  if (!res.ok && res.status !== 401) {
    console.error("Rehi logout failed:", res.status, res.body);
  }
}

export async function forwardRehiAuth(path: string, body: unknown) {
  const res = await postRehiAuth(path, { body });
  if (res.ok) return new NextResponse(null, { status: 204 });
  return NextResponse.json(res.body, { status: res.status });
}

function parseTokenPair(data: unknown): TokenPair | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (
    typeof d.accessToken !== "string" ||
    typeof d.refreshToken !== "string" ||
    typeof d.accessTokenExpiresAt !== "number" ||
    typeof d.refreshTokenExpiresAt !== "number"
  ) {
    return null;
  }
  return {
    accessToken: d.accessToken,
    accessTokenExpiresAt: d.accessTokenExpiresAt,
    refreshToken: d.refreshToken,
    refreshTokenExpiresAt: d.refreshTokenExpiresAt,
  };
}

function userFromAccessToken(accessToken: string): SessionUser {
  const payload = accessToken.split(".")[1] ?? "";
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  return {
    email: typeof claims.email === "string" ? claims.email : "",
    name: typeof claims.name === "string" ? claims.name : "",
  };
}

export function toWebSession(pair: TokenPair, picture?: string): WebSession {
  return {
    accessToken: pair.accessToken,
    expiresAt: pair.accessTokenExpiresAt,
    user: { ...userFromAccessToken(pair.accessToken), picture },
  };
}

export function setSessionCookie(res: NextResponse, pair: TokenPair) {
  res.cookies.set(SESSION_COOKIE, pair.refreshToken, {
    ...cookieOptions,
    expires: new Date(pair.refreshTokenExpiresAt),
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export function authFailure(call: Extract<AuthCall, { ok: false }>) {
  return NextResponse.json(call.body, { status: call.status });
}
