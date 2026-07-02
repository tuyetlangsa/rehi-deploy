"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import type { ComponentType } from "react";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

// Client value; `true` on the server so hydration matches the prerendered/
// precached shell. useSyncExternalStore reconciles to the real client value
// right after hydration WITHOUT a hydration-mismatch warning.
const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;

/**
 * Wraps a page so it renders directly when offline (fail-open) and behaves
 * exactly like withPageAuthRequired when online. Does NOT depend on the SDK's
 * internal offline behavior.
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return online ? <Guarded {...(props as any)} /> : <Page {...props} />;
  };
}
