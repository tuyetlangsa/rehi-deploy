"use client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";

/**
 * Wraps a page so it renders directly when offline (fail-open) and behaves
 * exactly like withPageAuthRequired when online. Does NOT depend on the SDK's
 * internal offline behavior.
 */
export function withOfflineAuth<P extends object>(Page: ComponentType<P>) {
  const Guarded = withPageAuthRequired(Page as ComponentType<any>);
  return function OfflineAware(props: P) {
    // Lazy init from navigator.onLine so an offline first-load never briefly
    // renders the guarded (redirect-prone) branch. `true` during SSR.
    const [online, setOnline] = useState(() =>
      typeof navigator === "undefined" ? true : navigator.onLine
    );
    useEffect(() => {
      const update = () => setOnline(navigator.onLine);
      update();
      window.addEventListener("online", update);
      window.addEventListener("offline", update);
      return () => {
        window.removeEventListener("online", update);
        window.removeEventListener("offline", update);
      };
    }, []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return online ? <Guarded {...(props as any)} /> : <Page {...props} />;
  };
}
