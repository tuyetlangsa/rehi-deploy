import type { WebSession } from "@/types/session";

export type SessionState =
  | { status: "loading" }
  | { status: "authenticated"; session: WebSession }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

const EXPIRY_SKEW_MS = 30_000;
const LOADING: SessionState = { status: "loading" };

let state: SessionState = LOADING;
let inflight: Promise<WebSession | null> | null = null;
const listeners = new Set<() => void>();

function setState(next: SessionState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getSessionState = () => state;
export const getServerSessionState = () => LOADING;

async function requestSession(): Promise<WebSession | null> {
  try {
    const res = await fetch("/api/auth/token", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (res.status === 401) {
      setState({ status: "unauthenticated" });
      return null;
    }
    if (!res.ok) throw new Error(`Session refresh failed: ${res.status}`);
    const session = (await res.json()) as WebSession;
    setState({ status: "authenticated", session });
    return session;
  } catch (error) {
    console.error(error);
    if (state.status === "loading") setState({ status: "unavailable" });
    return null;
  }
}

export function refreshSession(): Promise<WebSession | null> {
  inflight ??= requestSession().finally(() => {
    inflight = null;
  });
  return inflight;
}

export function ensureSession() {
  if (state.status === "loading") void refreshSession();
}

export async function getAccessToken(): Promise<string | null> {
  if (state.status === "unauthenticated") return null;
  if (
    state.status === "authenticated" &&
    state.session.expiresAt - EXPIRY_SKEW_MS > Date.now()
  ) {
    return state.session.accessToken;
  }
  const session = await refreshSession();
  return session?.accessToken ?? null;
}

export async function getAccessTokenAfterRejection(
  rejected: string
): Promise<string | null> {
  if (state.status === "authenticated" && state.session.accessToken !== rejected) {
    return state.session.accessToken;
  }
  const session = await refreshSession();
  return session?.accessToken ?? null;
}

export async function logout() {
  let redirectTo = "/";
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    const body = (await res.json()) as { redirectTo?: string };
    redirectTo = body.redirectTo ?? redirectTo;
  } catch (error) {
    console.error("Logout failed:", error);
  }
  setState({ status: "unauthenticated" });
  window.location.assign(redirectTo);
}
