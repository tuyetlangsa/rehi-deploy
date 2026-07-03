"use client";
import { useEffect } from "react";

/**
 * When offline, Next.js soft navigation (next/link) issues an RSC request that
 * the service worker can't satisfy for uncached routes, so link clicks fail.
 * This turns internal link clicks into hard navigations while offline, which
 * produce document requests that DO hit the precached offline shells
 * (/~offline-list, /~offline-article, /~offline). Online, it does nothing.
 */
export function OfflineNavGuard() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navigator.onLine) return;
      // Respect modifier clicks and already-handled events.
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      const target = e.target as HTMLElement | null;
      // Clicks on interactive controls inside a link (e.g. the "⋯" menu,
      // tag/delete buttons on an article card) should keep their own behavior.
      if (target?.closest?.("button, input, select, textarea, [role='button']"))
        return;

      const anchor = target?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Pure in-page hash change (e.g. #highlight-...) should not reload.
      if (url.pathname === window.location.pathname && url.hash) return;

      e.preventDefault();
      window.location.assign(url.href);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
