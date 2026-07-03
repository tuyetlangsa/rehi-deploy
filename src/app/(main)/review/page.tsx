"use client";
import { withOfflineAuth } from "@/components/offline-auth-guard";
import { ReviewView } from "@/components/review-view";

export default withOfflineAuth(ReviewView);
