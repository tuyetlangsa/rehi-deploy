"use client";
import React from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import TrashArticleItem from "./trash-article-item";

const TrashPage = () => {
  const deletedArticles = useLiveQuery(
    () =>
      db.articles
        .filter((a) => a.isDeleted === true)
        .reverse()
        .sortBy("createAt"),
    [],
    []
  );

  return (
    <section className="mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-white mb-6">Trash</h1>
      {!deletedArticles || deletedArticles.length === 0 ? (
        <p className="text-gray-400 italic flex justify-center items-center h-full">
          Trash is empty.
        </p>
      ) : (
        deletedArticles.map((item) => (
          <TrashArticleItem
            key={item.id}
            id={item.id}
            url={item.url}
            title={item.title}
            author={item.author}
            summary={item.summary}
            imagePreviewUrl={item.imagePreviewUrl}
            textContent={item.textContent}
            createAt={item.createAt}
            updateAt={item.updateAt}
            language={item.language}
            wordCount={item.wordCount}
            timeToRead={item.timeToRead}
            tagIds={item.tagIds}
            location={item.location}
          />
        ))
      )}
    </section>
  );
};

export default withPageAuthRequired(TrashPage);
