// Article chat history management service using localStorage

export interface ArticleChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ARTICLE_CHAT_HISTORY_KEY_PREFIX = "rehi_article_chat_history_";

export const ArticleChatHistoryService = {
  // Get chat history for a specific article
  getHistory(articleId: string): ArticleChatMessage[] {
    if (typeof window === "undefined") return [];
    try {
      const key = `${ARTICLE_CHAT_HISTORY_KEY_PREFIX}${articleId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Convert timestamps back to Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (e) {
      console.error("Failed to load article chat history:", e);
      return [];
    }
  },

  // Save chat history for a specific article
  saveHistory(articleId: string, messages: ArticleChatMessage[]) {
    if (typeof window === "undefined") return;
    try {
      const key = `${ARTICLE_CHAT_HISTORY_KEY_PREFIX}${articleId}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save article chat history:", e);
    }
  },

  // Clear chat history for a specific article
  clearHistory(articleId: string) {
    if (typeof window === "undefined") return;
    try {
      const key = `${ARTICLE_CHAT_HISTORY_KEY_PREFIX}${articleId}`;
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Failed to clear article chat history:", e);
    }
  },
};
