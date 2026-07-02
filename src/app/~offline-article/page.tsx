"use client";
import { useEffect, useState } from "react";
import { ArticleView } from "@/components/article-view";

/**
 * Served by the service worker as the offline fallback for /articles/[id]
 * document requests. useParams() does NOT resolve on a fallback document
 * (the served route is /~offline-article), so read the id from location.pathname.
 */
export default function OfflineArticle() {
  const [articleId, setArticleId] = useState<string | null>(null);

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    setArticleId(parts[parts.length - 1] ?? null);
  }, []);

  if (!articleId) return null;
  return <ArticleView articleId={articleId} />;
}
