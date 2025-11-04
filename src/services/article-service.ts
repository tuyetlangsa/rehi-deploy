import { http } from "@/lib/http";

export type ArticleLocation = "reading" | "later" | "archived";

export const ArticleService = {
  async updateLocation(
    articleId: string,
    location: ArticleLocation,
    createdAt: number
  ) {
    return http.patch(`/articles/${articleId}/${location}/${createdAt}`);
  },
  async deleteArticle(articleId: string, createdAt: number) {
    return http.delete(`/articles/${articleId}/${createdAt}`);
  },
  async recoverArticle(articleId: string, createdAt: number) {
    return http.patch(`/articles/recover/${articleId}/${createdAt}`);
  },

  async saveArticleNote(payload: SaveArticleNoteRequest) {
    return http.post(`/articles/note`, payload);
  },
  async assignTagToArticle(payload: AssignTagToArticleRequest) {
    return http.post(`/articles/assign-tag`, payload);
  },
  async getPublicArticle(articleId: string) {
    return http.get<GetPublicArticleResponse>(`/public/articles/${articleId}`);
  },
  async getPublicArticles() {
    return http.get<PublicArticle[]>(`/public/articles`);
  },
  async clonePublicArticle(articleId: string) {
    return http.post(`/public/articles/${articleId}/clone`);
  },
};

export interface SaveArticleNoteRequest {
  articleId: string;
  note: string;
  savedAt: number;
}

export interface AssignTagToArticleRequest {
  articleId: string;
  tagName: string;
  createAt: number;
}

export const searchArticles = async (searchText: string): Promise<string[]> => {
  if (!searchText.trim()) {
    return [];
  }
  const res = await http.get<string[]>(
    `/search?searchText=${encodeURIComponent(searchText)}`
  );
  return res.data || [];
};

export const publicArticle = async (articleId: string, updateAt: number) => {
  return http.patch(`/articles/${articleId}/${updateAt}/public`);
};

export interface GetPublicArticleResponse {
  article: PublicArticle;
  highlightResponses: PublicHighlight[];
}

export interface PublicArticle {
  id: string;
  url: string;
  title?: string;
  author?: string;
  summary?: string;
  imagePreviewUrl?: string;
  textContent?: string;
  language?: string;
  wordCount?: number;
  timeToRead?: string; // TimeSpan on server, stringified here
  cleanedHtml?: string; // maps server Content
  isDeleted: boolean;
  note?: string;
}

export interface PublicHighlight {
  id: string;
  articleId: string;
  location: string;
  html: string;
  markdown: string;
  plainText: string;
  createAt: number;
  updateAt?: number;
  color?: string;
  isDeleted: boolean;
  createBy: string;
}
