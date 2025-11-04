"use client";
import React from "react";
import Link from "next/link";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTag } from "@/db/repositories/tag";
import { TagService } from "@/services/tag-service";
import dayjs from "dayjs";
import { LocalStorageService } from "@/services/local-storage";
import { updateTag } from "@/db/repositories/tag";
import { Trash2 } from "lucide-react";
import { removeTagIdFromAllArticles } from "@/db/repositories/article";

const TagsPage = () => {
  const tags = useLiveQuery(
    () => db.tags.filter((t) => t.isDeleted === false).sortBy("name"),
    [],
    []
  );

  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState("");

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setNewTagName("");
    setShowCreateForm(false);
  };

  const handleSave = async () => {
    const name = newTagName.trim();
    if (!name) return;

    try {
      const createdAt = dayjs().valueOf();
      // Generate a local id (uuid-like) for IndexedDB
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      await addTag(id, name, false, createdAt, undefined);
      LocalStorageService.updateLastUpdateTime(createdAt);
      await TagService.createTag({ name, createAt: createdAt });

      setNewTagName("");
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create tag:", err);
    }
  };

  return (
    <section className="mx-auto px-6 py-8 w-full">
      <header className="mb-8 -mx-6 px-6">
        <h1 className="text-3xl font-bold text-foreground">Tags</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse all your tags saved in this workspace.
        </p>
      </header>

      {!tags || tags.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4 w-full max-w-md">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                No Tags Found
              </h2>
              <p className="text-muted-foreground">
                Create tags to organize your articles.
              </p>
            </div>

            {!showCreateForm ? (
              <Button onClick={handleCreateClick} className="w-full">
                Create Tag
              </Button>
            ) : (
              <div className="rounded-lg border border-border bg-card p-4 text-left space-y-3">
                <label className="text-sm text-muted-foreground">
                  Tag name
                </label>
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. JavaScript"
                  className="bg-background"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!newTagName.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="w-full group rounded-lg border border-border bg-card/50 hover:bg-card transition-colors p-4"
            >
              <Link
                href={`/articles?query=${encodeURIComponent(
                  `tag:${tag.name}`
                )}`}
                className="flex items-center justify-between"
              >
                <span className="text-foreground font-medium">{tag.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      const updateAt = dayjs().valueOf();
                      await updateTag(tag.id, { isDeleted: true });
                      await removeTagIdFromAllArticles(tag.id);
                      LocalStorageService.updateLastUpdateTime(updateAt);
                      await TagService.deleteTag(tag.name, updateAt);
                    } catch (err) {
                      console.error("Failed to delete tag:", err);
                    }
                  }}
                  title="Delete tag"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default withPageAuthRequired(TagsPage);
