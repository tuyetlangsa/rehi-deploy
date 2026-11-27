import { useEffect, useSyncExternalStore } from "react";
import {
  ensureSession,
  getServerSessionState,
  getSessionState,
  subscribeSession,
} from "@/lib/session";

export function useSession() {
  const state = useSyncExternalStore(
    subscribeSession,
    getSessionState,
    getServerSessionState
  );
  useEffect(ensureSession, []);
  return {
    status: state.status,
    user: state.status === "authenticated" ? state.session.user : undefined,
    isLoading: state.status === "loading",
  };
}
