"use client";
import type { ComponentType } from "react";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";

export function withSessionRequired<P extends object>(Page: ComponentType<P>) {
  return function SessionRequired(props: P) {
    const { status } = useSession();

    useEffect(() => {
      if (status !== "unauthenticated") return;
      const { pathname, search, hash } = window.location;
      const returnTo = encodeURIComponent(pathname + search + hash);
      window.location.assign(`/auth/login?returnTo=${returnTo}`);
    }, [status]);

    if (status === "loading" || status === "unauthenticated") return null;
    return <Page {...props} />;
  };
}
