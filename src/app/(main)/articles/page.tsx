"use client";
import { withOfflineAuth } from "@/components/offline-auth-guard";
import { ArticleList } from "@/components/article-list";

export default withOfflineAuth(ArticleList);
