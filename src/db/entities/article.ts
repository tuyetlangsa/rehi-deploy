import { Entity } from "dexie";
import type AppDB from "../AppDB";

export default class Article extends Entity<AppDB> {
  id!: string;
  url!: string;
  title!: string;
  author?: string;
  summary?: string;
  imagePreviewUrl!: string;
  textContent!: string;
  createAt!: number;
  updateAt!: number;
  language?: string;
  wordCount?: number;
  tagIds!: string[];
  timeToRead?: string;
  cleanedHtml?: string;
  isDeleted!: boolean;
  location!: string;
  note?: string;
  isPublic!: boolean;
}
