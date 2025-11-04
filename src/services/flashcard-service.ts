import { http } from "@/lib/http";

export interface FlashcardResponse {
  id: string;
  highlightId: string;
  dueDate: string;
}

export enum ReviewFeedback {
  Again = 0,
  Hard = 1,
  Good = 2,
  Easy = 3,
}

export interface ReviewFlashcardRequest {
  flashcardId: string;
  feedback: ReviewFeedback;
  reviewedAt: number;
}

export const FlashcardService = {
  async getFlashcards() {
    return http.get<FlashcardResponse[]>("/flashcards/review");
  },

  async reviewFlashcard(request: ReviewFlashcardRequest) {
    return http.post("/flashcards/review", request);
  },
};
