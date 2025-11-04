"use client";
import React, { useEffect, useState } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { FlashcardService } from "@/services/flashcard-service";
import { db } from "@/db/db";
import type Highlight from "@/db/entities/highlight";
import type Article from "@/db/entities/article";
import { Flashcard } from "@/components/flashcard";
import dayjs from "dayjs";
import { LocalStorageService } from "@/services/local-storage";

interface FlashcardData {
  id: string;
  highlightId: string;
  dueDate: string;
}

interface FlashcardContent {
  flashcardId: string;
  highlight: Highlight;
  article: Article | undefined;
}

const ReviewPage = () => {
  const [flashcards, setFlashcards] = useState<FlashcardContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        const response = await FlashcardService.getFlashcards();
        console.log(response.data);
        const flashcardData: FlashcardData[] = response.data || [];

        const flashcardsWithContent = await Promise.all(
          flashcardData.map(async (flashcard) => {
            const highlight = (await db.highlights.get(
              flashcard.highlightId
            )) as Highlight | undefined;

            if (!highlight) {
              return null;
            }

            const article = (await db.articles.get(highlight.articleId)) as
              | Article
              | undefined;

            return {
              flashcardId: flashcard.id,
              highlight,
              article,
            };
          })
        );

        const validFlashcards = flashcardsWithContent.filter(
          (card): card is FlashcardContent => card !== null
        );
        setFlashcards(validFlashcards);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to fetch flashcards:", err);
        setError("Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleReview = async (feedback: string, flashcardId: string) => {
    try {
      const reviewedAt = dayjs().valueOf();
      await FlashcardService.reviewFlashcard({
        flashcardId,
        feedback: Number(feedback),
        reviewedAt,
      });
      LocalStorageService.updateLastUpdateTime(reviewedAt);

      handleNext();
    } catch (err) {
      console.error("Failed to review flashcard:", err);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-4xl w-full bg-card rounded-xl shadow-2xl p-12 border border-border">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">
                Loading flashcards...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-4xl w-full bg-card rounded-xl shadow-2xl p-12 border border-border">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-destructive mb-4">
                Error loading flashcards
              </h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (flashcards.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-4xl w-full bg-card rounded-xl shadow-2xl p-12 border border-border">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                No Flashcards Available
              </h1>
              <p className="text-muted-foreground">
                You don&apos;t have any flashcards to review at the moment.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-6xl w-full bg-card rounded-xl shadow-2xl p-12 border border-border">
        <h1 className="text-4xl font-bold text-center text-foreground mb-8">
          Flashcard Review
        </h1>

        <div className="relative">
          {flashcards[currentIndex] && (
            <Flashcard
              text={flashcards[currentIndex].highlight.text}
              html={flashcards[currentIndex].highlight.html}
              markdown={flashcards[currentIndex].highlight.markdown}
              note={flashcards[currentIndex].highlight.note}
              articleTitle={flashcards[currentIndex].article?.title}
              articleId={flashcards[currentIndex].highlight.articleId}
              highlightId={flashcards[currentIndex].highlight.id}
              flashcardId={flashcards[currentIndex].flashcardId}
              cardNumber={currentIndex + 1}
              totalCards={flashcards.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onReview={handleReview}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default withPageAuthRequired(ReviewPage);
