"use client";
import React, { useEffect, useState } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Link from "next/link";
import Image from "next/image";
import { ArticleService, type PublicArticle } from "@/services/article-service";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const PublicArticlesPage = () => {
  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cloningIds, setCloningIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ArticleService.getPublicArticles();
        if (!mounted) return;
        setArticles(res.data || []);
      } catch (e) {
        setError("Failed to load public articles.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCloneArticle = async (
    e: React.MouseEvent<HTMLButtonElement>,
    articleId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setCloningIds((prev) => new Set(prev).add(articleId));
    try {
      const response = await ArticleService.clonePublicArticle(articleId);
      if (response.isSuccess) {
        toast.success("Article cloned successfully");
        // Refresh the page to update the list
        window.location.reload();
      } else {
        throw new Error(response.message || "Failed to clone article");
      }
    } catch (err) {
      console.error("Failed to clone article:", err);
      toast.error("Failed to clone article. Please try again.");
      setCloningIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-200 mb-4">Loading…</h1>
          <p className="text-gray-400">Fetching public articles…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-400 mb-2">{error}</h1>
          <p className="text-gray-400">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <section className="mx-auto px-4 py-16 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-200 mb-3">
          Public Articles
        </h1>
        <p className="text-gray-400">No public articles available.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-200 mb-6">Public Articles</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a) => {
          const imgSrc = a.imagePreviewUrl || "/article_image.png";
          const domain = (() => {
            try {
              return new URL(a.url).hostname;
            } catch {
              return "";
            }
          })();
          return (
            <div
              key={String(a.id)}
              className="group rounded-lg border border-neutral-800 hover:bg-neutral-900/40 transition-colors overflow-hidden relative"
            >
              <Link href={`/public/articles/${a.id}`} className="block">
                <div className="w-full h-40 relative bg-neutral-900">
                  <Image
                    src={imgSrc}
                    alt={a.title || "Article"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {a.title || "Untitled"}
                  </h3>
                  {a.summary && (
                    <p className="text-sm text-neutral-400 line-clamp-3">
                      {a.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                    {domain && <span>{domain}</span>}
                    {domain && a.timeToRead && <span>•</span>}
                    {a.timeToRead && <span>{String(a.timeToRead)}</span>}
                  </div>
                </div>
              </Link>
              <div className="absolute top-2 right-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={(e) => handleCloneArticle(e, String(a.id))}
                  disabled={cloningIds.has(String(a.id))}
                  className="bg-neutral-800/90 hover:bg-neutral-700 text-white border border-neutral-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default withPageAuthRequired(PublicArticlesPage);
