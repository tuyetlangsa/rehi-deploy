"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import type { ComponentType } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;

/**
 * Wraps a page so it renders directly when offline (fail-open) and behaves
 * like withPageAuthRequired when online.
 *
 * It renders nothing on the server / first paint (until mounted). This is
 * deliberate: withPageAuthRequired throws during SSR for these auth-gated
 * routes, which made the server return 500. Since all content comes from
 * IndexedDB on the client anyway, SSR never showed real content — so we skip
 * it, the server returns 200, and the client renders after mount. This also
 * guarantees the server/client first render match (both null).
 */
export function withOfflineAuth<P extends object>(Page: ComponentType<P>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Guarded = withPageAuthRequired(Page as ComponentType<any>);
  return function OfflineAware(props: P) {
    const online = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Don't render the auth-guarded (SSR-throwing) tree on the server or the
    // first client paint — avoids the 500 and any hydration mismatch.
    if (!mounted) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return online ? <Guarded {...(props as any)} /> : <Page {...props} />;
  };
}
