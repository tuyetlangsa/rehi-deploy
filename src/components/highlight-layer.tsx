"use client";

import React from "react";
import { useTextSelection } from "@/hooks/use-text-selection";
import { SelectionMenu } from "@/components/selection-menu";
import { addHighlight } from "@/db/repositories/highlight";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { v4 as uuidv4 } from "uuid";
import {
  CreateHighlightRequest,
  HighlightService,
} from "@/services/highlight-service";
import { LocalStorageService } from "@/services/local-storage";
import { useArticleChatStore } from "@/store/article-chat-store";
import { useSandStateStore } from "@/store/sidebar-state";

dayjs().format();
dayjs.extend(isToday);

interface HighlightLayerProps {
  articleId: string;
}

export function HighlightLayer({ articleId }: HighlightLayerProps) {
  const { selection, rangeRect, isReverseSelected, clearSelection } =
    useTextSelection();
  const setPendingQuestion = useArticleChatStore(
    (state) => state.setPendingQuestion
  );
  const setShouldSwitchToChat = useArticleChatStore(
    (state) => state.setShouldSwitchToChat
  );
  const toggle_r_sidebar = useSandStateStore((state) => state.toggle_r_sidebar);
  const r_sidebar_state = useSandStateStore((state) => state.r_sidebar_state);

  const handleSaveHighlight = async (color: string) => {
    if (!selection) return;

    const id = uuidv4();
    const now = dayjs().valueOf();

    await addHighlight(
      id,
      articleId,
      selection.location, // Use location for API compatibility
      selection.text,
      selection.html,
      selection.markdown,
      color,
      now,
      "rehi-web",
      false,
      now
    );

    const request: CreateHighlightRequest = {
      id,
      articleId,
      location: selection.location, // Use location for API compatibility
      html: selection.html,
      markdown: selection.markdown,
      plainText: selection.text,
      color: color,
      createAt: now,
      createBy: "rehi-web",
    };
    LocalStorageService.updateLastUpdateTime(now);

    await HighlightService.createHighlight(request);
    clearSelection();
  };

  const handleAskRehi = () => {
    if (!selection) return;

    // Open sidebar if closed (InfoSidebar will sync this with actual sidebar state)
    if (!r_sidebar_state) {
      toggle_r_sidebar();
    }

    // Set question and trigger tab switch
    setPendingQuestion(selection.text);
    setShouldSwitchToChat(true);
    clearSelection();
  };

  return (
    <>
      {selection && rangeRect && (
        <SelectionMenu
          rect={rangeRect}
          isReverse={isReverseSelected}
          onHighlight={handleSaveHighlight}
          onAskRehi={handleAskRehi}
        />
      )}
    </>
  );
}
