"use client";

import { Button } from "@/components/ui/button";
import { Highlighter, MessageCircle } from "lucide-react";
import React, { useState } from "react";

type SelectionMenuProps = {
  rect: DOMRect;
  isReverse: boolean;
  onHighlight: (color: string) => void;
  onAskRehi?: () => void;
};

// Brighter highlight colors with higher opacity for better visibility
const HIGHLIGHT_COLORS = [
  {
    name: "Yellow",
    value: "rgba(255, 235, 59, 0.6)", // Brighter yellow with more opacity
    bgClass: "bg-yellow-400",
  },
  {
    name: "Green",
    value: "rgba(76, 175, 80, 0.6)", // Brighter green with more opacity
    bgClass: "bg-emerald-500",
  },
  {
    name: "Blue",
    value: "rgba(33, 150, 243, 0.6)", // Brighter blue with more opacity
    bgClass: "bg-blue-500",
  },
  {
    name: "Purple",
    value: "rgba(156, 39, 176, 0.6)", // Brighter purple with more opacity
    bgClass: "bg-violet-500",
  },
  {
    name: "Pink",
    value: "rgba(233, 30, 99, 0.6)", // Brighter pink with more opacity
    bgClass: "bg-pink-500",
  },
];

export function SelectionMenu({
  rect,
  isReverse,
  onHighlight,
  onAskRehi,
}: SelectionMenuProps) {
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value);
  const offset = 8;
  const vertical = 0;

  // Calculate position with mobile-friendly adjustments
  const calculatePosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 280; // Approximate menu width
    const menuHeight = 40; // Approximate menu height

    let left =
      (isReverse ? rect.left - offset : rect.right + offset) + window.scrollX;
    let top = rect.top + window.scrollY - vertical;

    // On mobile, prefer showing menu above selection to avoid keyboard issues
    const isMobile = viewportWidth < 768;
    if (isMobile) {
      // Show menu above selection if there's not enough space below
      if (top + menuHeight > viewportHeight - 100) {
        top = rect.top + window.scrollY - menuHeight - 10;
      }
      // Center horizontally on mobile for better UX
      left = Math.max(10, Math.min(left, viewportWidth - menuWidth - 10));
    } else {
      // Desktop: keep original logic but ensure it's within viewport
      if (left + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth - 10;
      }
      if (left < 0) {
        left = 10;
      }
    }

    return { left, top };
  };

  const { left, top } = calculatePosition();

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        zIndex: 50,
      }}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      className="flex items-center gap-1 sm:gap-2 bg-neutral-800 border border-neutral-700 rounded-md px-1.5 sm:px-2 py-1 shadow-md"
    >
      {/* Color picker */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => setSelectedColor(color.value)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setSelectedColor(color.value);
            }}
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all active:scale-110 hover:scale-110 ${
              selectedColor === color.value
                ? "border-white scale-110"
                : "border-neutral-600 hover:border-neutral-400"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>

      {/* Highlight button */}
      <Button
        size="sm"
        onClick={() => onHighlight(selectedColor)}
        onTouchEnd={(e) => {
          e.preventDefault();
          onHighlight(selectedColor);
        }}
        className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs sm:text-sm"
      >
        <Highlighter className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>

      {/* Ask Rehi button */}
      {onAskRehi && (
        <Button
          size="sm"
          onClick={onAskRehi}
          onTouchEnd={(e) => {
            e.preventDefault();
            onAskRehi();
          }}
          className="h-6 sm:h-7 px-1.5 sm:px-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
        >
          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      )}
    </div>
  );
}
