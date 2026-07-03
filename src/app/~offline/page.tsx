"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { AppChrome } from "@/components/app-chrome";
import { ArticleList } from "@/components/article-list";
import { TagsView } from "@/components/tags-view";
import { TrashView } from "@/components/trash-view";
import { ReviewView } from "@/components/review-view";
import { SettingsView } from "@/components/settings-view";

/**
 * Offline shell for every (main) route except article detail (which has its
 * own chrome-less layout and is handled by /~offline-article). The service
 * worker serves this page as the document fallback; it reads the real path
 * and renders the matching view from IndexedDB inside the app chrome.
 */
export default function OfflineShell() {
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => setPath(location.pathname), []);
  if (path === null) return null;

  let view: React.ReactNode;
  if (/^\/articles\/?$/.test(path)) view = <ArticleList />;
  else if (path.startsWith("/tags")) view = <TagsView />;
  else if (path.startsWith("/trash")) view = <TrashView />;
  else if (path.startsWith("/review")) view = <ReviewView />;
  else if (path.startsWith("/settings")) view = <SettingsView />;
  else
    view = (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-200 mb-4">
            You&apos;re offline
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mb-6">
            This page isn&apos;t available offline yet.
          </p>
          <Link
            href="/articles"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );

  return (
    <AppChrome>
      <Suspense>{view}</Suspense>
    </AppChrome>
  );
}
