import Article from '@/db/entities/article'
import { create } from 'zustand'

interface ArticleStoreProps {
  article: Article | null;
  setArticle: (article: Article) => void;
}

export const useArticleStore = create<ArticleStoreProps>((set) => ({
  article: null,
  setArticle: (article: Article) => set({ article }),
}))