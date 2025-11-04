"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface FlashcardProps {
  text: string;
  html: string | undefined;
  markdown: string | undefined;
  note: string | undefined;
  articleTitle: string | undefined;
  articleId: string;
  highlightId: string;
  flashcardId: string;
  cardNumber: number;
  totalCards: number;
  onNext: () => void;
  onPrevious: () => void;
  onReview: (feedback: string, flashcardId: string) => void;
}

export function Flashcard({
  text,
  html,
  markdown,
  note,
  articleTitle,
  articleId,
  highlightId,
  flashcardId,
  cardNumber,
  totalCards,
  onNext,
  onPrevious,
  onReview,
}: FlashcardProps) {
  const handleGotoHighlight = () => {
    window.location.href = `/articles/${articleId}#highlight-${highlightId}`;
  };

  const handleFeedback = (feedback: string) => {
    const feedbackMap: Record<string, number> = {
      Again: 0,
      Hard: 1,
      Good: 2,
      Easy: 3,
    };
    onReview(feedbackMap[feedback].toString(), flashcardId);
  };
  return (
    <div className="relative w-full">
      <div className="relative w-full h-[600px]">
        <div className="w-full h-full rounded-xl shadow-xl border border-border bg-muted overflow-hidden">
          <div className="h-full flex flex-col p-8">
            <div className="mb-6 flex-shrink-0">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Highlight
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flashcard-scroll">
              <div
                className="text-2xl text-foreground leading-relaxed font-medium prose prose-lg max-w-none prose-invert"
                dangerouslySetInnerHTML={{ __html: html || text }}
              />

              {note && (
                <div className="mt-8 pt-6 border-t border-border">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4 block">
                    Your Note
                  </span>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-lg text-foreground leading-relaxed">
                      {note}
                    </p>
                  </div>
                </div>
              )}
              {articleTitle && (
                <button
                  onClick={handleGotoHighlight}
                  className="mt-8 pt-6 border-t border-border w-full text-left hover:opacity-80 transition-opacity"
                >
                  <span className="text-xs text-muted-foreground">From:</span>
                  <p className="text-sm text-foreground mt-1 hover:underline">
                    {articleTitle}
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={cardNumber === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <div className="flex gap-2">
          {Array.from({ length: totalCards }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 === cardNumber ? "bg-primary" : "bg-muted-foreground"
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={cardNumber === totalCards}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2 mt-6 justify-center">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleFeedback("Again")}
          className="flex-1"
        >
          Again
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback("Hard")}
          className="flex-1"
        >
          Hard
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => handleFeedback("Good")}
          className="flex-1"
        >
          Good
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback("Easy")}
          className="flex-1"
        >
          Easy
        </Button>
      </div>
    </div>
  );
}
