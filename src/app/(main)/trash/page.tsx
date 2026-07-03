"use client";
import { withOfflineAuth } from "@/components/offline-auth-guard";
import { TrashView } from "@/components/trash-view";

export default withOfflineAuth(TrashView);
