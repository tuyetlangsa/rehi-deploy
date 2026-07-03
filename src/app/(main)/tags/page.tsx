"use client";
import { withOfflineAuth } from "@/components/offline-auth-guard";
import { TagsView } from "@/components/tags-view";

export default withOfflineAuth(TagsView);
