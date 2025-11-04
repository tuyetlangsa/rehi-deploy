import { db } from "../db";
import Highlight from "../entities/highlight";

export async function addHighlight(
  id: string,
  articleId: string,
  location: string,
  text: string,
  html: string | undefined,
  markdown: string | undefined,
  color: string | undefined,
  createdAt: number,
  createBy: "rehi-web" | "rehi-browser-extension",
  isDeleted: boolean,
  updatedAt?: number,
  note?: string
) {
  await db.highlights.add({
    id,
    articleId,
    location,
    text,
    html,
    markdown,
    color,
    createdAt,
    createBy,
    updatedAt,
    isDeleted,
    note,
  });
}

export async function updateHighlight(id: string, changes: Partial<Highlight>) {
  await db.highlights.update(id, changes);
}

export async function deleteHighlight(id: string) {
  await db.highlights.update(id, { isDeleted: true });
}
