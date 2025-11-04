import { db } from "../db";
import Tag from "../entities/tag";

export async function addTag(
  id: string,
  name: string,
  isDeleted: boolean,
  createAt: number,
  updateAt?: number | undefined
) {
  await db.tags.add({
    id,
    name,
    isDeleted,
    createAt,
    updateAt,
  });
}
export async function updateTag(id: string, changes: Partial<Tag>) {
  await db.tags.update(id, changes);
}
