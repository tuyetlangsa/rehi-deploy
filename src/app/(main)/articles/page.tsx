"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import {
  updateArticleLocation,
  updateArticle,
} from "@/db/repositories/article";
import { addTag } from "@/db/repositories/tag";
import { TagService } from "@/services/tag-service";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useSearchParams, useRouter } from "next/navigation";
import { ArticleService, publicArticle } from "@/services/article-service";
import { LocalStorageService } from "@/services/local-storage";
dayjs().format();
dayjs.extend(isToday);

interface ArticleItemProps {
  id: string;
  url: string;
  title: string;
  author?: string;
  summary?: string;
  imagePreviewUrl: string;
  textContent: string;
  createAt: number;
  updateAt: number;
  language?: string;
  wordCount?: number;
  timeToRead?: string;
  tagIds: string[];
  location?: string;
  isPublic?: boolean;
}
const ArticleItemComponent = ({
  id,
  url,
  title,
  author,
  summary,
  imagePreviewUrl,
  textContent,
  createAt,
  updateAt,
  language,
  wordCount,
  timeToRead,
  tagIds,
  location: currentLocation,
  isPublic,
}: ArticleItemProps) => {
  const [formattedTime, setFormattedTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const allTags = useLiveQuery(() =>
    db.tags.filter((t) => !t.isDeleted).toArray()
  );

  const tags = useLiveQuery(
    () =>
      tagIds && tagIds.length > 0
        ? db.tags.filter((t) => tagIds.includes(t.id)).toArray()
        : [],
    [tagIds]
  );

  useEffect(() => {
    const date = dayjs(createAt);
    let displayTime = "";

    if (date.isToday()) {
      displayTime = date.format("h:mm A");
    } else {
      displayTime = date.format("MMM D, YYYY");
    }
    setFormattedTime(displayTime);
  }, [createAt]);

  const handleMove = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    newLocation: "reading" | "later" | "archived"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await updateArticleLocation(id, newLocation);
      const createdAt = dayjs().valueOf();
      LocalStorageService.updateLastUpdateTime(createdAt);

      await ArticleService.updateLocation(id, newLocation, createdAt);
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await updateArticle(id, { isDeleted: true });

      const createdAt = dayjs().valueOf();
      LocalStorageService.updateLastUpdateTime(createdAt);
      await ArticleService.deleteArticle(id, createdAt);
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyUrl = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (url) {
        await navigator.clipboard.writeText(url);
      }
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenOriginal = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowTagInput = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTagInput(true);
    setMenuOpen(false);
  };

  const handleTogglePublic = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const nowTs = dayjs().valueOf();
      const newIsPublic = !isPublic;
      await updateArticle(id, { isPublic: newIsPublic, updateAt: nowTs });
      LocalStorageService.updateLastUpdateTime(nowTs);
      await publicArticle(id, nowTs);
      setMenuOpen(false);
    } catch (err) {
      console.error("Failed to update public status:", err);
    }
  };

  const handleCopyPublicLink = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const publicUrl = `${window.location.origin}/public/articles/${id}`;
      await navigator.clipboard.writeText(publicUrl);
      setMenuOpen(false);
    } catch (err) {
      console.error("Failed to copy public link:", err);
    }
  };

  const handleAssignTag = async (tagName: string) => {
    const trimmedName = tagName.trim();
    if (!trimmedName) return;

    try {
      const existingTag = allTags?.find(
        (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingTag) {
        // Tag exists, just assign it
        if (!tagIds.includes(existingTag.id)) {
          const newTagIds = [...tagIds, existingTag.id];
          await updateArticle(id, { tagIds: newTagIds });

          const createdAt = dayjs().valueOf();
          LocalStorageService.updateLastUpdateTime(createdAt);
          await ArticleService.assignTagToArticle({
            articleId: id,
            tagName: existingTag.name,
            createAt: createdAt,
          });
        }
      } else {
        // Create new tag
        const createdAt = dayjs().valueOf();
        const newTagId = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

        await addTag(newTagId, trimmedName, false, createdAt, createdAt);
        const newTagIds = [...tagIds, newTagId];
        await updateArticle(id, { tagIds: newTagIds });

        LocalStorageService.updateLastUpdateTime(createdAt);
        await TagService.createTag({ name: trimmedName, createAt: createdAt });
        await ArticleService.assignTagToArticle({
          articleId: id,
          tagName: trimmedName,
          createAt: createdAt,
        });
      }

      setTagInput("");
      setShowTagInput(false);
    } catch (err) {
      console.error("Failed to assign tag:", err);
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      handleAssignTag(tagInput);
    }
  };

  const imageSrc = imagePreviewUrl || "/article_image.png";

  return (
    <Link
      href={`/articles/${id}`}
      className="relative flex gap-2 border p-4 mb-6transition w-full border-none hover:bg-[#28313b]"
    >
      <div className="flex-shrink-0">
        <Image
          loading="lazy"
          src={imageSrc}
          alt={title}
          width={200}
          height={100}
          className="object-cover mx-6 rounded-lg w-[100px] h-[100px]"
        />
      </div>

      <div className="flex flex-col flex-1 justify-between text-[#FFFFFF80]">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-sm mt-1 line-clamp-3">{summary}</p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex">
          <span className="text-sm line-clamp-1">{url}</span>
          {url && language && <span className="mx-1">•</span>}
          <span className="text-sm line-clamp-1">{language}</span>
          {language && timeToRead && <span className="mx-1">•</span>}
          <span className="text-sm line-clamp-1">{timeToRead}</span>
          {isPublic && (
            <>
              <span className="mx-1">•</span>
              <span className="text-sm line-clamp-1 text-green-400">
                Public
              </span>
            </>
          )}
        </div>
      </div>
      <div className="ml-auto flex items-start gap-3">
        <div className="text-[#FFFFFF80] text-sm line-clamp-1 mt-1">
          <div>{formattedTime}</div>
        </div>
        <div className="relative">
          <button
            aria-label="More actions"
            className="text-white px-2 py-1 rounded hover:bg-[#2f3945]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            ⋯
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-44 bg-[#1f2730] border border-[#2f3945] rounded-md shadow-lg z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <button
                className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2f3945]"
                onClick={(e) => handleCopyUrl(e)}
              >
                Copy article URL
              </button>
              <button
                className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2f3945]"
                onClick={(e) => handleOpenOriginal(e)}
              >
                Open original article
              </button>
              <button
                className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2f3945]"
                onClick={handleShowTagInput}
              >
                Add article tag
              </button>
              {isPublic ? (
                <>
                  <button
                    className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2f3945]"
                    onClick={(e) => handleCopyPublicLink(e)}
                  >
                    Copy public link
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2f3945]"
                    onClick={(e) => handleTogglePublic(e)}
                  >
                    Disable public link
                  </button>
                </>
              ) : (
                <button
                  className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2f3945]"
                  onClick={(e) => handleTogglePublic(e)}
                >
                  Open public link
                </button>
              )}
              <div className="border-t border-[#2f3945] mt-2" />
              {(["reading", "later", "archived"] as const)
                .filter((loc) => loc !== (currentLocation || "").toLowerCase())
                .map((loc) => (
                  <button
                    key={loc}
                    className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-[#2f3945]"
                    onClick={(e) => handleMove(e, loc)}
                  >
                    {`Move to ${loc.charAt(0).toUpperCase()}${loc.slice(1)}`}
                  </button>
                ))}
              <div className="border-t border-[#2f3945] mt-2" />
              <button
                className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#2f3945]"
                onClick={(e) => handleDelete(e)}
              >
                Move to Trash
              </button>
            </div>
          )}
        </div>
      </div>

      {showTagInput && (
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTagInput(false);
            setTagInput("");
          }}
        >
          <div
            className="bg-card border border-border rounded-lg p-4 w-full max-w-md m-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h3 className="text-lg font-semibold mb-3">Add Tag</h3>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Type tag name..."
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground mb-3"
              autoFocus
            />

            {allTags && allTags.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-2">
                  Existing tags:
                </p>
                <div className="flex flex-wrap gap-2">
                  {allTags
                    .filter((t) => !tagIds.includes(t.id))
                    .map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleAssignTag(tag.name)}
                        className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                      >
                        {tag.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowTagInput(false);
                  setTagInput("");
                }}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignTag(tagInput)}
                disabled={!tagInput.trim()}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawLocation = (searchParams.get("location") || "reading").toLowerCase();
  const location = ["reading", "later", "archived"].includes(rawLocation)
    ? rawLocation
    : "reading";

  const [query, setQuery] = useState("");
  const appliedQuery = searchParams.get("query") || "";
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const articles = useLiveQuery(async () => {
    const allArticles = await db.articles
      .filter(
        (a) =>
          a.isDeleted === false && (a.location || "").toLowerCase() === location
      )
      .reverse()
      .sortBy("createAt");

    if (!appliedQuery) return allArticles;

    const tags = await db.tags.filter((t) => !t.isDeleted).toArray();

    return allArticles.filter((article) => {
      const normalizedQuery = appliedQuery.toLowerCase();

      // Parse AND conditions
      const andConditions = appliedQuery.split(" and ");

      // Process each AND condition
      for (const condition of andConditions) {
        const trimmedCondition = condition.trim().toLowerCase();

        // Handle OR conditions within each AND condition
        const orConditions = condition.split(" or ");

        if (orConditions.length > 1) {
          // Check if ANY OR condition matches
          const orMatches = orConditions.some((orPart) => {
            return checkCondition(orPart.trim(), article, tags);
          });
          if (!orMatches) return false;
        } else {
          // Single condition (AND)
          if (!checkCondition(trimmedCondition, article, tags)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [location, appliedQuery]);

  const checkCondition = (condition: string, article: any, tags: any[]) => {
    // Tag filters
    if (condition.includes("tag:")) {
      const tagParts = condition.split(/tag:/g);
      for (const part of tagParts.slice(1)) {
        const tagName = part.trim().toLowerCase();
        const articleTags = tags.filter((t) => article.tagIds.includes(t.id));
        const matches = articleTags.some((t) =>
          t.name.toLowerCase().includes(tagName)
        );
        if (!matches) return false;
      }
      return true;
    }

    // Author filters
    if (condition.includes("author:")) {
      const authorParts = condition.split(/author:/g);
      for (const part of authorParts.slice(1)) {
        const author = part.trim().toLowerCase();
        if (!article.author?.toLowerCase().includes(author)) return false;
      }
      return true;
    }

    // isDeleted filters
    if (condition.includes("isdeleted:")) {
      const deletedPart = condition.match(/isdeleted:\s*(\w+)/i)?.[1];
      if (deletedPart?.toLowerCase() === "false" && article.isDeleted)
        return false;
      if (deletedPart?.toLowerCase() === "true" && !article.isDeleted)
        return false;
      return true;
    }

    // Free text search
    const matches =
      article.title?.toLowerCase().includes(condition) ||
      article.summary?.toLowerCase().includes(condition) ||
      article.textContent?.toLowerCase().includes(condition);

    return matches;
  };

  return (
    <>
      {isCommandPaletteOpen && (
        <div
          className="fixed inset-0 backdrop-blur-[2px] flex items-start justify-center z-50 pt-[33vh]"
          onClick={() => setIsCommandPaletteOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Search Articles
              </h2>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("query", query);
                    router.push(`/articles?${params.toString()}`);
                    setIsCommandPaletteOpen(false);
                  }
                  if (e.key === "Escape") {
                    setIsCommandPaletteOpen(false);
                  }
                }}
                placeholder="Try: tag:ai, author:john, neural networks..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Examples: <code className="bg-muted px-1 rounded">tag:ai</code>,{" "}
                <code className="bg-muted px-1 rounded">author:john</code>,{" "}
                <code className="bg-muted px-1 rounded">
                  tag:ai and author:john
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto px-4 py-8">
        {!articles || articles.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-200 mb-4">
                No Articles Found
              </h1>
              <p className="text-gray-400">
                It seems there are no articles available at the moment.
              </p>
            </div>
          </div>
        ) : (
          articles.map((item) => (
            <ArticleItemComponent
              key={item.id}
              id={item.id}
              url={item.url}
              title={item.title}
              author={item.author}
              summary={item.summary}
              imagePreviewUrl={item.imagePreviewUrl}
              textContent={item.textContent}
              createAt={item.createAt}
              updateAt={item.updateAt}
              language={item.language}
              wordCount={item.wordCount}
              timeToRead={item.timeToRead}
              tagIds={item.tagIds}
              location={item.location}
              isPublic={item.isPublic}
            />
          ))
        )}
      </section>
    </>
  );
}

export default withPageAuthRequired(Page);
