import { addArticle, updateArticle } from "@/db/repositories/article";
import { addHighlight, updateHighlight } from "@/db/repositories/highlight";
import { addTag, updateTag } from "@/db/repositories/tag";
import { http } from "@/lib/http";

export default interface GetAllStateResponse {
  articles: ArticleResponse[];
  tags: TagResponse[];
  highlights: HighlightResponse[];
}

export interface ArticleResponse {
  id: string;
  url: string;
  title: string;
  author: string;
  summary: string;
  textContent: string;
  imagePreviewUrl: string;
  createAt: number;
  updateAt: number;
  language: string;
  wordCount: number;
  tagIds: string[];
  timeToRead: string;
  cleanedHtml: string;
  isDeleted: boolean;
  location: string;
  note: string | undefined;
  isPublic: boolean;
}

export interface TagResponse {
  id: string;
  name: string;
  isDeleted: boolean;
  createAt: number;
  updateAt: number;
}

export interface HighlightResponse {
  id: string;
  articleId: string;
  location: string;
  html: string;
  markdown: string;
  plainText: string;
  createAt: number;
  updatedAt: number;
  color: string;
  isDeleted: boolean;
  createBy: "rehi-web" | "rehi-browser-extension";
  note: string | undefined;
}

export interface Updated {
  articles: ArticleResponse[];
  tags: TagResponse[];
  highlights: HighlightResponse[];
}

export interface Created {
  articles: ArticleResponse[];
  tags: TagResponse[];
  highlights: HighlightResponse[];
}

export interface FetchStateResponse {
  created: Created;
  updated: Updated;
}

export const getAllState = async () => {
  const res = await http.get<GetAllStateResponse>(`/states`);
  return res;
};

export const fetchState = async (lastUpdateTime: number) => {
  const res = await http.get<FetchStateResponse>(`/states/${lastUpdateTime}`);
  return res;
};

export const syncState = async () => {
  const lastUpdateTime = localStorage.getItem("lastUpdateTime") || "0";
  localStorage.setItem("lastUpdateTime", lastUpdateTime); // đảm bảo có giá trị

  const lastUpdate = Number(lastUpdateTime);

  // === Lần đầu sync toàn bộ data ===
  if (lastUpdate === 0) {
    const response = await getAllState();
    if (response.isSuccess) {
      const { articles = [], tags = [], highlights = [] } = response.data;

      if (tags.length > 0) {
        await Promise.all(
          tags.map((tag) =>
            addTag(tag.id, tag.name, tag.isDeleted, tag.createAt, tag.updateAt)
          )
        );
      }

      if (articles.length > 0) {
        await Promise.all(
          articles.map((article) =>
            addArticle(
              article.id,
              article.url,
              article.title,
              article.author,
              article.summary,
              article.imagePreviewUrl,
              article.textContent,
              article.createAt,
              article.updateAt,
              article.language,
              article.wordCount,
              article.tagIds,
              article.timeToRead,
              article.cleanedHtml,
              article.isDeleted,
              article.location,
              article.note,
              article.isPublic
            )
          )
        );
      }

      if (highlights.length > 0) {
        await Promise.all(
          highlights.map((highlight) =>
            addHighlight(
              highlight.id,
              highlight.articleId,
              highlight.location,
              highlight.plainText,
              highlight.html,
              highlight.markdown,
              highlight.color,
              highlight.createAt,
              highlight.createBy,
              highlight.isDeleted,
              highlight.updatedAt,
              highlight.note
            )
          )
        );
      }

      // Cập nhật lastUpdateTime
      const articleTimes = articles.map((a) => a.updateAt || a.createAt);
      const tagTimes = tags.map((t) => t.updateAt || t.createAt);
      const highlightTimes = highlights.map((h) => h.updatedAt || h.createAt);
      const allTimes = [...articleTimes, ...tagTimes, ...highlightTimes];
      console.log("allTimes", allTimes);
      if (allTimes.length > 0) {
        const maxTime = Math.max(...allTimes);
        console.log("maxTime", maxTime);
        localStorage.setItem("lastUpdateTime", maxTime.toString());
      }
    }
    return;
  }

  // === Incremental sync ===
  const response = await fetchState(lastUpdate);
  if (!response.isSuccess) return;

  const {
    created: {
      articles: createdArticles = [],
      tags: createdTags = [],
      highlights: createdHighlights = [],
    },
    updated: {
      articles: updatedArticles = [],
      tags: updatedTags = [],
      highlights: updatedHighlights = [],
    },
  } = response.data;

  // --- Created tags/articles ---
  if (createdTags.length > 0) {
    await Promise.all(
      createdTags.map((tag) =>
        addTag(tag.id, tag.name, tag.isDeleted, tag.createAt, tag.updateAt)
      )
    );
  }

  if (createdArticles.length > 0) {
    await Promise.all(
      createdArticles.map((article) =>
        addArticle(
          article.id,
          article.url,
          article.title,
          article.author,
          article.summary,
          article.imagePreviewUrl,
          article.textContent,
          article.createAt,
          article.updateAt,
          article.language,
          article.wordCount,
          article.tagIds,
          article.timeToRead,
          article.cleanedHtml,
          article.isDeleted,
          article.location,
          article.note,
          article.isPublic
        )
      )
    );
  }

  if (createdHighlights.length > 0) {
    await Promise.all(
      createdHighlights.map((highlight) =>
        addHighlight(
          highlight.id,
          highlight.articleId,
          highlight.location,
          highlight.plainText,
          highlight.html,
          highlight.markdown,
          highlight.color,
          highlight.createAt,
          highlight.createBy,
          highlight.isDeleted,
          highlight.updatedAt,
          highlight.note
        )
      )
    );
  }

  // --- Updated tags/articles/highlights ---
  if (updatedTags.length > 0) {
    await Promise.all(
      updatedTags.map((tag) =>
        updateTag(tag.id, {
          name: tag.name,
          isDeleted: tag.isDeleted,
        })
      )
    );
  }

  if (updatedArticles.length > 0) {
    await Promise.all(
      updatedArticles.map((article) =>
        updateArticle(article.id, {
          author: article.author,
          title: article.title,
          summary: article.summary,
          textContent: article.textContent,
          imagePreviewUrl: article.imagePreviewUrl,
          createAt: article.createAt,
          updateAt: article.updateAt,
          language: article.language,
          wordCount: article.wordCount,
          tagIds: article.tagIds,
          timeToRead: article.timeToRead,
          cleanedHtml: article.cleanedHtml,
          isDeleted: article.isDeleted,
          location: article.location,
          note: article.note,
          isPublic: article.isPublic,
        })
      )
    );
  }

  if (updatedHighlights.length > 0) {
    await Promise.all(
      updatedHighlights.map((highlight) =>
        updateHighlight(highlight.id, {
          articleId: highlight.articleId,
          location: highlight.location,
          text: highlight.plainText,
          html: highlight.html,
          markdown: highlight.markdown,
          color: highlight.color,
          createdAt: highlight.createAt,
          updatedAt: highlight.updatedAt,
          isDeleted: highlight.isDeleted,
          note: highlight.note,
        })
      )
    );
  }

  const allArticles = [...createdArticles, ...updatedArticles];
  const allTags = [...createdTags, ...updatedTags];
  const allHighlights = [...createdHighlights, ...updatedHighlights];
  const articleTimes = allArticles.map((a) => a.updateAt || a.createAt);
  const tagTimes = allTags.map((t) => t.updateAt || t.createAt);
  const highlightTimes = allHighlights.map((h) => h.updatedAt || h.createAt);
  const allTimes = [...articleTimes, ...tagTimes, ...highlightTimes];
  if (allTimes.length > 0) {
    const maxTime = Math.max(...allTimes);
    console.log("maxTime", maxTime);
    localStorage.setItem("lastUpdateTime", maxTime.toString());
  }
};
