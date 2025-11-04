import { create } from "zustand";

interface ArticleChatStoreProps {
  pendingQuestion: string | null;
  setPendingQuestion: (question: string | null) => void;
  clearPendingQuestion: () => void;
  shouldSwitchToChat: boolean;
  setShouldSwitchToChat: (should: boolean) => void;
}

export const useArticleChatStore = create<ArticleChatStoreProps>()((set) => ({
  pendingQuestion: null,
  setPendingQuestion: (question: string | null) =>
    set({ pendingQuestion: question }),
  clearPendingQuestion: () => set({ pendingQuestion: null }),
  shouldSwitchToChat: false,
  setShouldSwitchToChat: (should: boolean) =>
    set({ shouldSwitchToChat: should }),
}));
