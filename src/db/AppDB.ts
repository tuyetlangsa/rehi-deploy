import Dexie, { type EntityTable } from "dexie";
import Article from "./entities/article";
import Tag from "./entities/tag";
import Highlight from "./entities/highlight";

export default class AppDB extends Dexie {
  articles!: EntityTable<Article, "id">;
  tags!: EntityTable<Tag, "id">;
  highlights!: EntityTable<Highlight, "id">;
  constructor() {
    super("RehiDB");
    this.version(1).stores({
      articles:
        "id, url, author, createAt, updateAt, *tagIds, isDeleted, timeToRead, location, isPublic",
      tags: "id, name, isDeleted",
      highlights: "id, articleId, createdAt, updatedAt, isDeleted",
    });
    this.articles.mapToClass(Article);
    this.tags.mapToClass(Tag);
    this.highlights.mapToClass(Highlight);
  }
}
