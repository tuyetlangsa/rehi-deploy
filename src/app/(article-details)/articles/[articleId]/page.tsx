"use client";
import { useParams } from "next/navigation";
import { ArticleView } from "@/components/article-view";
import { withOfflineAuth } from "@/components/offline-auth-guard";

function ArticlePage() {
  const params = useParams();
  const articleId = params.articleId as string;
  return <ArticleView articleId={articleId} />;
}

export default withOfflineAuth(ArticlePage);
