"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchPaletteStore } from "@/store/search-palette-store";
import { searchArticles } from "@/services/article-service";
import { db } from "@/db/db";
import Image from "next/image";
import { useLiveQuery } from "dexie-react-hooks";
import type Article from "@/db/entities/article";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Extract snippet from text containing searchText
function getSearchSnippet(
  text: string,
  searchText: string,
  maxLength: number = 150
): string {
  if (!text || !searchText) return "";

  const lowerText = text.toLowerCase();
  const lowerSearch = searchText.toLowerCase();
  const searchIndex = lowerText.indexOf(lowerSearch);

  if (searchIndex === -1) {
    // If searchText not found, return beginning of text
    return (
      text.substring(0, maxLength) + (text.length > maxLength ? "..." : "")
    );
  }

  // Calculate start and end positions
  const start = Math.max(0, searchIndex - maxLength / 2);
  const end = Math.min(
    text.length,
    searchIndex + searchText.length + maxLength / 2
  );

  let snippet = text.substring(start, end);

  // Add ellipsis if needed
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return snippet;
}

// Highlight searchText in snippet
function highlightSearchText(
  snippet: string,
  searchText: string
): React.ReactNode {
  if (!snippet || !searchText) return snippet;

  const parts = snippet.split(
    new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  );

  return parts.map((part, index) => {
    if (part.toLowerCase() === searchText.toLowerCase()) {
      return (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function SearchCommandPalette() {
  const router = useRouter();
  const isOpen = useSearchPaletteStore((state) => state.isOpen);
  const close = useSearchPaletteStore((state) => state.close);
  const [searchText, setSearchText] = useState("");
  const [articleIds, setArticleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const debouncedSearchText = useDebounce(searchText, 300);

  // Fetch article IDs from API
  useEffect(() => {
    const fetchArticleIds = async () => {
      if (!debouncedSearchText.trim()) {
        setArticleIds([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const ids = await searchArticles(debouncedSearchText);
        setArticleIds(ids);
        setSelectedIndex(0); // Reset selection when new results come
      } catch (error) {
        console.error("Failed to search articles:", error);
        setArticleIds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleIds();
  }, [debouncedSearchText]);

  // Query articles from IndexedDB
  const articles = useLiveQuery(
    async () => {
      if (articleIds.length === 0) return [];
      return await db.articles
        .where("id")
        .anyOf(articleIds)
        .and((a) => !a.isDeleted)
        .toArray();
    },
    [articleIds],
    []
  );

  // Sort articles to match API result order
  const sortedArticles = React.useMemo(() => {
    if (!articles || articleIds.length === 0) return [];
    const articleMap = new Map(articles.map((a) => [a.id, a]));
    return articleIds
      .map((id) => articleMap.get(id))
      .filter((a): a is Article => a !== undefined);
  }, [articles, articleIds]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        setSearchText("");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < sortedArticles.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && sortedArticles[selectedIndex]) {
        e.preventDefault();
        handleArticleClick(sortedArticles[selectedIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, sortedArticles, selectedIndex, close]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchText("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const handleArticleClick = (articleId: string) => {
    router.push(`/articles/${articleId}`);
    close();
    setSearchText("");
    setSelectedIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-[2px] bg-black/50 flex items-start justify-center z-50 pt-[20vh]"
      onClick={close}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <input
              ref={inputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              autoFocus
            />
          </div>
          {isLoading && (
            <p className="text-xs text-muted-foreground mt-2">Searching...</p>
          )}
        </div>

        {/* Results List */}
        <div ref={resultsRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {sortedArticles.length === 0 && !isLoading && searchText && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No articles found
            </div>
          )}
          {sortedArticles.length === 0 && !searchText && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Start typing to search articles...
            </div>
          )}
          {sortedArticles.map((article, index) => (
            <button
              key={article.id}
              onClick={() => handleArticleClick(article.id)}
              className={`w-full text-left p-3 rounded-md transition-colors ${
                index === selectedIndex
                  ? "bg-primary/20 border border-primary"
                  : "hover:bg-muted border border-transparent"
              }`}
            >
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <Image
                    src={article.imagePreviewUrl || "/article_image.png"}
                    alt={article.title}
                    width={50}
                    height={50}
                    className="rounded object-cover w-[50px] h-[50px]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {article.title}
                  </h3>
                  {searchText && article.textContent && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {highlightSearchText(
                        getSearchSnippet(article.textContent, searchText, 150),
                        searchText
                      )}
                    </p>
                  )}
                  {!searchText && article.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    {article.author && (
                      <span className="truncate">{article.author}</span>
                    )}
                    {article.author && article.timeToRead && <span>•</span>}
                    {article.timeToRead && <span>{article.timeToRead}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Enter
              </kbd>{" "}
              Open
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Esc
              </kbd>{" "}
              Close
            </span>
          </div>
          {sortedArticles.length > 0 && (
            <span>
              {sortedArticles.length} result
              {sortedArticles.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
