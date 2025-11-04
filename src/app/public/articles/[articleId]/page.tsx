"use client";
import React, { useEffect, useState } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useParams } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { applyHighlights } from "@/lib/highlight-util";
import type Highlight from "@/db/entities/highlight";
import {
  ArticleService,
  type GetPublicArticleResponse,
} from "@/services/article-service";

const PublicArticlePage = () => {
  const params = useParams();
  const articleId = params.articleId as string;

  const [article, setArticle] = useState<
    GetPublicArticleResponse["article"] | null
  >(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ArticleService.getPublicArticle(articleId);
        if (!mounted) return;
        const data = res.data!;
        setArticle(data.article!);

        // Map API highlights to local shape used by applyHighlights (text-based)
        const mapped: Highlight[] = (data.highlightResponses || []).map(
          (h) =>
            ({
              id: String(h.id),
              articleId: String(h.articleId),
              location: h.location,
              text: h.plainText,
              html: h.html,
              markdown: h.markdown,
              color: h.color || undefined,
              createdAt: h.createAt,
              updatedAt: h.updateAt,
              createBy: "rehi-web",
              isDeleted: h.isDeleted,
            } as unknown as Highlight)
        );
        setHighlights(mapped);

        // No store usage on public page
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [articleId]);

  // Apply read-only highlights when article/highlights change
  useEffect(() => {
    if (!article) return;
    if (typeof document === "undefined") return;
    const container = document.getElementById("article-content-id");
    if (!container) return;
    applyHighlights(container as HTMLElement, highlights || []);
  }, [article?.cleanedHtml, highlights]);

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-200 mb-4">Loading…</h1>
          <p className="text-gray-400">Fetching public article…</p>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 ">
      <div className="w-full">
        <header className="mb-12 pb-8 border-b border-gray-800">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-6 text-gray-400 text-sm">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {article.timeToRead && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{article.timeToRead}</span>
                </div>
              )}
            </div>
            <div />
          </div>
        </header>

        <div
          id="article-content"
          className="prose prose-invert prose-lg max-w-none"
        >
          {article.cleanedHtml && (
            <div
              id="article-content-id"
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.cleanedHtml! }}
            />
          )}
        </div>
      </div>
      {/* Do NOT render <HighlightLayer /> or any sidebars/stores here */}
    </article>
  );
};

export default withPageAuthRequired(PublicArticlePage);
