import { db } from "../db";
import Article from "../entities/article";

export async function addArticle(
  id: string,
  url: string,
  title: string,
  author: string | undefined,
  summary: string | undefined,
  imagePreviewUrl: string,
  textContent: string,
  createAt: number,
  updateAt: number,
  language: string | undefined,
  wordCount: number | undefined,
  tagIds: string[],
  timeToRead: string,
  cleanedHtml: string,
  isDeleted: boolean,
  location: string,
  note: string | undefined,
  isPublic: boolean
) {
  await db.articles.add({
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
    tagIds,
    timeToRead,
    cleanedHtml,
    isDeleted,
    location,
    note,
    isPublic,
  });
}

export async function updateArticle(id: string, changes: Partial<Article>) {
  await db.articles.update(id, changes);
}

export async function updateArticleLocation(id: string, location: string) {
  await db.articles.update(id, { location });
}

export async function removeTagIdFromAllArticles(tagId: string) {
  const articles = await db.articles
    .filter((article) => article.tagIds?.includes(tagId))
    .toArray();

  for (const article of articles) {
    const updatedTagIds = article.tagIds.filter((id) => id !== tagId);
    await db.articles.update(article.id, { tagIds: updatedTagIds });
  }
}
