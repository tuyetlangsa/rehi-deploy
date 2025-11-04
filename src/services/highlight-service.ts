import { http } from "@/lib/http";

export interface CreateHighlightRequest {
  id: string;
  articleId: string;
  location: string;
  html: string;
  markdown: string;
  plainText: string;
  color: string | undefined;
  createAt: number;
  createBy: "rehi-web";
}
export interface SaveHighlightNoteRequest {
  highlightId: string;
  note: string;
  savedAt: number;
}
export const HighlightService = {
  async createHighlight(request: CreateHighlightRequest) {
    return http.post(`/highlights`, request);
  },
  async deleteHighlight(highlightId: string, updateAt: number) {
    return http.delete(`/highlights/${highlightId}/${updateAt}`);
  },

  async saveHighlightNote(request: SaveHighlightNoteRequest) {
    return http.post(`/highlights/note`, request);
  },
};
