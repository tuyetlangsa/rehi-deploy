"use client";

import { useEffect } from "react";
import { getAccessToken } from "@/lib/session";
import type { TokenPair } from "@/types/session";

let handoff: Promise<void> | null = null;

async function handOffSession() {
  const accessToken = await getAccessToken();
  if (!accessToken) return;
  const res = await fetch("/api/auth/extension-session", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Extension session failed: ${res.status}`);
  const { refreshToken } = (await res.json()) as Partial<TokenPair>;
  if (typeof refreshToken !== "string") {
    throw new Error("Malformed extension session");
  }
  window.postMessage(
    { type: "REHI_EXTENSION_SESSION", refreshToken },
    window.location.origin
  );
}

export function ExtensionBridge() {
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window || event.origin !== window.location.origin) {
        return;
      }
      if (event.data?.type !== "REHI_EXTENSION_READY") return;
      handoff ??= handOffSession()
        .catch(console.error)
        .finally(() => {
          handoff = null;
        });
    };
    window.addEventListener("message", onMessage);
    window.postMessage({ type: "REHI_EXTENSION_PING" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
