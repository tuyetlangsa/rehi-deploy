"use client";

import {
  getElementPath,
  getSelectionHTML,
  htmlToMarkdown,
} from "@/lib/highlight-util";
import { useEffect, useState, useCallback } from "react";

interface SelectionData {
  location: string; // Keep for API compatibility
  text: string;
  html: string;
  markdown: string;
  startArrayPath: number[];
  endArrayPath: number[];
  startStringPath: string;
  endStringPath: string;
}
export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionData | null>(null);
  const [rangeRect, setRangeRect] = useState<DOMRect | null>(null);
  const [isReverseSelected, setIsReverseSelected] = useState<boolean>(false);

  const extractSelectionData = useCallback(
    (selection: Selection): SelectionData | null => {
      if (!selection.rangeCount) return null;

      const range = selection.getRangeAt(0);

      const { stringPath: startStringPath, arrayPath: startArrayPath } =
        getElementPath(range.startContainer);
      const { stringPath: endStringPath, arrayPath: endArrayPath } =
        getElementPath(range.endContainer);

      // Create location string for API compatibility (but we won't use it for positioning)
      const location = `${startStringPath}:${range.startOffset},${endStringPath}:${range.endOffset}`;

      const text = selection.toString();
      const html = getSelectionHTML(range);
      const markdown = htmlToMarkdown(html);

      return {
        location, // Keep for API calls
        text,
        html,
        markdown,
        startArrayPath,
        endArrayPath,
        startStringPath,
        endStringPath,
      };
    },
    []
  );

  const isSelectionInContainer = useCallback(
    (selection: Selection, container: Element): boolean => {
      if (!selection.rangeCount) return false;

      const range = selection.getRangeAt(0);

      return (
        container.contains(range.startContainer) &&
        container.contains(range.endContainer)
      );
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    const sel = document.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount <= 0) {
      setSelection(null);
      setRangeRect(null);
      setIsReverseSelected(false);
      return;
    }
    const articleContent = document.getElementById("article-content-id");
    if (!articleContent || !isSelectionInContainer(sel, articleContent)) {
      setSelection(null);
      setRangeRect(null);
      setIsReverseSelected(false);
      return;
    }
    const selectionData = extractSelectionData(sel);
    setSelection(selectionData);

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setRangeRect(rect);
    const reverse =
      range.startContainer === sel.focusNode &&
      range.endOffset === sel.anchorOffset;
    setIsReverseSelected(reverse);
  }, [extractSelectionData, isSelectionInContainer]);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setRangeRect(null);
    setIsReverseSelected(false);
    document.getSelection()?.removeAllRanges();
  }, []);

  return { selection, rangeRect, isReverseSelected, clearSelection };
}
