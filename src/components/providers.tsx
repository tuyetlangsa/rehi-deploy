"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { useSearchPaletteStore } from "@/store/search-palette-store";
import { SearchCommandPalette } from "@/components/search-command-palette";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  const openSearchPalette = useSearchPaletteStore((state) => state.open);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Listen for token requests from service worker
      navigator.serviceWorker.addEventListener("message", async (event) => {
        if (event.data.type === "GET_TOKEN" && event.ports && event.ports[0]) {
          try {
            // Get token from Auth0
            const accessToken = await getAccessToken();

            // Send token back to service worker via MessageChannel
            event.ports[0].postMessage({
              type: "TOKEN_RESPONSE",
              token: accessToken,
            });
          } catch (error) {
            console.error("Failed to get access token:", error);
            // Send null token if failed
            event.ports[0].postMessage({
              type: "TOKEN_RESPONSE",
              token: null,
            });
          }
        }
      });
    }
  }, []);

  // When a new service worker takes control (first install, or a fresh deploy),
  // reload once so the page is actually served through the SW. Without this the
  // tab keeps running uncontrolled until a manual refresh, so offline silently
  // fails right after a deploy. The `refreshing` guard prevents a reload loop.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );
    return () =>
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
  }, []);

  // Global keyboard handler for Ctrl+P / Cmd+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        openSearchPalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearchPalette]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <SearchCommandPalette />
      <Toaster />
    </QueryClientProvider>
  );
}
