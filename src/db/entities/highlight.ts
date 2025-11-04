import { Entity } from "dexie";
import type AppDB from "../AppDB";

export default class Highlight extends Entity<AppDB> {
  id!: string;
  articleId!: string;
  location!: string;
  text!: string; // plain text of the selection
  html?: string; // HTML fragment of the selection
  markdown?: string; // Markdown version of the selection
  color?: string; // optional highlight color/tag
  createdAt!: number;
  updatedAt?: number;
  createBy!: "rehi-web" | "rehi-browser-extension";
  isDeleted!: boolean;
  note?: string;
}
