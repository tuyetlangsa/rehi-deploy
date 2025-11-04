import { http } from "@/lib/http";
import { ArticleItem } from "@/model/article";

export const fetchArticleById = async (id: string) => {
  const res = await http.get<ArticleItem>(`/articles/${id}`);
  // if (!res.ok) throw new Error(res.error?.message || "Failed to fetch article");
  return res.data!;
};

export const fetchArticles = async () => {
  const res = await http.get<ArticleItem[]>(`/articles`);
  // if (!res.ok)
  //   throw new Error(res.error?.message || "Failed to fetch articles");
  return res.data!;
};

export const createArticle = async (
  payload: Omit<ArticleItem, "id" | "createdAt">
) => {
  const res = await http.post<ArticleItem>(`/articles`, payload);
  // if (!res.ok)
  //   throw new Error(res.error?.message || "Failed to create article");
  return res.data!;
};

export const updateArticle = async (
  id: string,
  payload: Partial<ArticleItem>
) => {
  const res = await http.put<ArticleItem>(`/articles/${id}`, payload);
  // if (!res.ok)
  //   throw new Error(res.error?.message || "Failed to update article");
  return res.data!;
};

export const deleteArticle = async (id: string) => {
  const res = await http.delete<ArticleItem>(`/articles/${id}`);
  // if (!res.ok)
  //   throw new Error(res.error?.message || "Failed to delete article");
  return res.data!;
};
