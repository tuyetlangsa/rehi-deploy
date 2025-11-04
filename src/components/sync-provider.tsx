"use client";
import { useEffect } from "react";
import { syncState } from "@/services/state";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let isRunning = false;
    const interval = setInterval(async () => {
      if (isRunning) return;
      isRunning = true;
      try {
        await syncState();
      } catch (err) {
        console.error("Sync error:", err);
      } finally {
        isRunning = false;
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
