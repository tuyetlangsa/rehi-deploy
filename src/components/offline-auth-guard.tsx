"use client";
import type { ComponentType } from "react";
import { useSyncExternalStore } from "react";
import { withSessionRequired } from "@/components/session-guard";

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

export function withOfflineAuth<P extends object>(Page: ComponentType<P>) {
  const Guarded = withSessionRequired(Page);
  return function OfflineAware(props: P) {
    const online = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );
    return online ? <Guarded {...props} /> : <Page {...props} />;
  };
}
