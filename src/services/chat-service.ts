import { http } from "@/lib/http";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatWithHistoryRequest {
  question: string;
  history?: ChatHistoryMessage[];
}

export interface ArticleDocument {
  id?: string;
  articleId?: string;
  content?: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
  relevantDocuments?: ArticleDocument[];
}

export interface ChatWithArticleRequest {
  articleId: string;
  question: string;
  history?: ChatHistoryMessage[];
}

export const ChatService = {
  async chatWithHistory(question: string, history: ChatHistoryMessage[] = []) {
    const url = `/chat/${encodeURIComponent(question)}`;
    const payload: ChatWithHistoryRequest = {
      question,
      history,
    };
    return http.post<ChatResponse>(url, payload);
  },

  async chatWithArticle(
    articleId: string,
    question: string,
    history: ChatHistoryMessage[] = []
  ) {
    const url = `/chat-with-article/${encodeURIComponent(question)}`;
    const payload: ChatWithArticleRequest = {
      articleId,
      question,
      history,
    };
    return http.post<ChatResponse>(url, payload);
  },
};
