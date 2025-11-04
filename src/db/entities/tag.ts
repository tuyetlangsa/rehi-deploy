import { Entity } from "dexie";
import type AppDB from "../AppDB";

export default class Tag extends Entity<AppDB> {
  id!: string;
  name!: string;
  isDeleted!: boolean;
  createAt!: number;
  updateAt?: number;
}
