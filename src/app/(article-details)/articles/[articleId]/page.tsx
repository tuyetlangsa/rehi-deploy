"use client";
import { db } from "@/db/db";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Clock, Calendar, User, Ellipsis } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { ReadingPreferences } from "@/components/reading-preferences";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ArticleSidebar } from "@/components/article-sidebar";
import { InfoSidebar } from "@/components/info-sidebar";
import { Button } from "@/components/ui/button";
import { useSandStateStore } from "@/store/sidebar-state";
import { useArticleStore } from "@/store/article-store";
import { HighlightLayer } from "@/components/highlight-layer";
import {
  applyHighlights,
  addHighlightClickHandlers,
} from "@/lib/highlight-util";
import { deleteHighlight, updateHighlight } from "@/db/repositories/highlight";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { LocalStorageService } from "@/services/local-storage";
import { HighlightService } from "@/services/highlight-service";
import { useParams } from "next/navigation";
dayjs().format();
dayjs.extend(isToday);

const ArticlePage = () => {
  const params = useParams();
  const articleId = params.articleId as string;
  const article = useLiveQuery(() => db.articles.get(articleId));
  const highlights = useLiveQuery(
    () =>
      db.highlights
        .where("articleId")
        .equals(articleId)
        .and((h) => !h.isDeleted)
        .toArray(),
    [articleId]
  );
  const setArticle = useArticleStore((state) => state.setArticle);
  useEffect(() => {
    if (article) {
      setArticle(article);
    }
  }, [article, setArticle]);
  const toggle_r_sidebar = useSandStateStore((state) => state.toggle_r_sidebar);

  const [readingStyles, setReadingStyles] = useState({
    fontFamily: "Inter",
    fontSize: 16,
  });

  // Handle highlight deletion
  const handleDeleteHighlight = async (highlightId: string) => {
    try {
      await deleteHighlight(highlightId);
      const createdAt = dayjs().valueOf();
      LocalStorageService.updateLastUpdateTime(createdAt);
      await HighlightService.deleteHighlight(highlightId, createdAt);
    } catch (error) {
      console.error("Failed to delete highlight:", error);
    }
  };

  // Handle highlight note editing
  const handleEditNote = async (highlightId: string, note: string) => {
    try {
      await updateHighlight(highlightId, {
        note,
        updatedAt: dayjs().valueOf(),
      });
      const savedAt = dayjs().valueOf();
      LocalStorageService.updateLastUpdateTime(savedAt);
      await HighlightService.saveHighlightNote({ highlightId, note, savedAt });
    } catch (error) {
      console.error("Failed to save highlight note:", error);
    }
  };

  // Apply all saved highlights whenever content or highlights change
  useEffect(() => {
    if (typeof document === "undefined") return;
    const container = document.getElementById("article-content-id");
    if (!container) return;

    applyHighlights(container as HTMLElement, highlights || []);

    // Add click handlers after highlights are applied
    addHighlightClickHandlers(
      container as HTMLElement,
      handleDeleteHighlight,
      handleEditNote,
      highlights || []
    );
  }, [highlights, article?.cleanedHtml, readingStyles]);

  // Prevent default context menu on mobile to allow custom highlight menu
  useEffect(() => {
    if (typeof document === "undefined") return;
    const container = document.getElementById("article-content-id");
    if (!container) return;

    const handleContextMenu = (e: Event) => {
      // Only prevent if there's a text selection
      const selection = document.getSelection();
      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        e.preventDefault();
      }
    };

    container.addEventListener("contextmenu", handleContextMenu);
    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [article?.cleanedHtml]);

  // Scroll to highlight when hash is present in URL
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash && hash.startsWith("#highlight-")) {
      const highlightId = hash.replace("#highlight-", "");

      // Wait for highlights to be applied
      setTimeout(() => {
        const highlightElement = document.querySelector(
          `article-highlight[data-highlight-id="${highlightId}"]`
        );

        if (highlightElement) {
          highlightElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 500);
    }
  }, [highlights]);

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-200 mb-4">
            Article is not found.
          </h1>
          <p className="text-gray-400">
            The article you&apos;re looking for is not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
      {/* Back to Articles Button */}
      <SidebarInset className="w-full">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="inline-block"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Back to Articles</span>
          <span className="sm:hidden">Back</span>
        </Link>
        {/* Article Header */}
        <header className="mb-6 sm:mb-12 pb-4 sm:pb-8 border-b border-gray-800">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 text-gray-400 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{article.author}</span>
                </div>
              )}

              {article.createAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    {new Date(article.createAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {article.timeToRead && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{article.timeToRead}</span>
                </div>
              )}
            </div>
            <div className="flex flex-row gap-2">
              <ReadingPreferences onStyleChange={setReadingStyles} />
              <Button
                onClick={toggle_r_sidebar}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <Ellipsis />
              </Button>
            </div>
          </div>
        </header>
        {/* Article Content */}
        <div
          id="article-content"
          className="prose prose-invert prose-sm sm:prose-base md:prose-lg max-w-none"
        >
          {article.cleanedHtml && (
            <div
              id="article-content-id"
              className="article-content"
              style={{
                fontFamily: readingStyles.fontFamily,
                fontSize: `${readingStyles.fontSize}px`,
              }}
              dangerouslySetInnerHTML={{ __html: article.cleanedHtml! }}
            />
          )}
        </div>
      </SidebarInset>
      <HighlightLayer articleId={articleId} />
      <LeftSideBar />
      <RightSideBar />
    </article>
  );
};
const LeftSideBar = () => {
  return (
    <SidebarProvider
      name="left-sidebar"
      className="w-fit overflow-hidden max-h-dvh"
    >
      <ArticleSidebar />
    </SidebarProvider>
  );
};

const RightSideBar = () => {
  return (
    <SidebarProvider
      defaultOpen={false}
      name="right-sidebar"
      className="w-fit overflow-hidden max-h-dvh"
      style={
        {
          "--sidebar-width": "21.25rem", // 340px
        } as React.CSSProperties
      }
    >
      <InfoSidebar />
    </SidebarProvider>
  );
};

export default withPageAuthRequired(ArticlePage);
