"use client";
import { Suspense } from "react";
import { ArticleList } from "@/components/article-list";

/**
 * Served by the service worker as the offline fallback for the /articles
 * list route. Reuses the real list component, which reads everything from
 * IndexedDB, so the library is browsable offline. Suspense is required
 * because ArticleList uses useSearchParams().
 */
export default function OfflineList() {
  return (
    <Suspense>
      <ArticleList />
    </Suspense>
  );
}
