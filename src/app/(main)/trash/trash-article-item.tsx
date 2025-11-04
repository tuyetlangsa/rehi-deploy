"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { updateArticle } from "@/db/repositories/article";
import { ArticleService } from "@/services/article-service";
import { LocalStorageService } from "@/services/local-storage";

dayjs.extend(isToday);

interface TrashArticleItemProps {
  id: string;
  url: string;
  title: string;
  author?: string;
  summary?: string;
  imagePreviewUrl: string;
  textContent: string;
  createAt: number;
  updateAt: number;
  language?: string;
  wordCount?: number;
  timeToRead?: string;
  tagIds: string[];
  location?: string;
}

const TrashArticleItem: React.FC<TrashArticleItemProps> = ({
  id,
  url,
  title,
  author,
  summary,
  imagePreviewUrl,
  textContent,
  createAt,
  updateAt,
  language,
  wordCount,
  timeToRead,
  tagIds,
  location,
}) => {
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    const date = dayjs(createAt);
    let displayTime = "";

    if (date.isToday()) {
      displayTime = date.format("h:mm A");
    } else {
      displayTime = date.format("MMM D, YYYY");
    }
    setFormattedTime(displayTime);
  }, [createAt]);

  const handleRecover = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await updateArticle(id, { isDeleted: false });
      const createdAt = dayjs().valueOf();
      LocalStorageService.updateLastUpdateTime(createdAt);
      await ArticleService.recoverArticle(id, createdAt);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="relative flex gap-2 border p-4 mb-6transition w-full border-none bg-transparent"
      aria-disabled
    >
      {imagePreviewUrl && (
        <div className="flex-shrink-0">
          <Image
            loading="lazy"
            src={imagePreviewUrl}
            alt={imagePreviewUrl}
            width={200}
            height={100}
            className="object-cover mx-6 rounded-lg w-[100px] h-[100px] opacity-60"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 justify-between text-[#FFFFFF80]">
        <div>
          <h3 className="text-sm font-semibold text-white opacity-70">
            {title}
          </h3>
          <p className="text-sm mt-1 line-clamp-3 opacity-70">{summary}</p>
        </div>
        <div className="flex">
          <span className="text-sm line-clamp-1 opacity-70">{url}</span>
        </div>
      </div>
      <div className="ml-auto flex items-start gap-3">
        <div className="text-[#FFFFFF80] text-sm line-clamp-1 mt-1">
          <div>{formattedTime}</div>
        </div>
        <div className="relative">
          <button
            aria-label="Recover"
            className="text-white px-3 py-1 rounded bg-[#2f3945] hover:bg-[#3a4654]"
            onClick={(e) => handleRecover(e)}
          >
            Recover
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrashArticleItem;
