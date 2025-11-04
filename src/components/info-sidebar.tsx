"use client";
import { useEffect, useState } from "react";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { useSandStateStore } from "@/store/sidebar-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useArticleStore } from "@/store/article-store";
import { FileText, Trash2, Edit3, Save, X } from "lucide-react";
import type Highlight from "@/db/entities/highlight";
import { deleteHighlight, updateHighlight } from "@/db/repositories/highlight";
import { updateArticle } from "@/db/repositories/article";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { LocalStorageService } from "@/services/local-storage";
import { HighlightService } from "@/services/highlight-service";
import { ArticleService } from "@/services/article-service";
import { ArticleChat } from "./article-chat";
import { useArticleChatStore } from "@/store/article-chat-store";
dayjs().format();
dayjs.extend(isToday);

type InfoData = {
  title?: string;
  url?: string;
  authors?: string;
  published?: string;
  length?: string;
  progress?: number;
  language?: string;
};

type NoteBookData = {
  documentNote: string;
  highlights: Highlight[];
};

interface InfoSidebarProps {
  infoTab?: InfoData;
  infoNotebook?: NoteBookData;
}

const getLanguageName = (code: string | undefined): string => {
  if (!code) return "None";

  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code; // fallback to original code if invalid
  }
};

export function InfoSidebar() {
  const r_sidebar_state = useSandStateStore((state) => state.r_sidebar_state);
  const { open, toggleSidebar } = useSidebar();
  const article = useArticleStore((state) => state.article);
  const [activeTab, setActiveTab] = useState("info");

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [originalNote, setOriginalNote] = useState("");

  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(
    null
  );
  const [highlightNoteContent, setHighlightNoteContent] = useState("");

  const highlights = useLiveQuery(
    () =>
      article?.id
        ? db.highlights
            .where("articleId")
            .equals(article.id)
            .and((h) => !h.isDeleted)
            .toArray()
        : [],
    [article?.id]
  );

  useEffect(() => {
    if (article?.note) {
      setNoteContent(article.note);
      setOriginalNote(article.note);
    } else {
      setNoteContent("");
      setOriginalNote("");
    }
  }, [article?.note]);

  const handleDeleteHighlight = async (highlightId: string) => {
    try {
      await deleteHighlight(highlightId);
      const createdAt = dayjs().valueOf();
      LocalStorageService.updateLastUpdateTime(createdAt);
      await HighlightService.deleteHighlight(highlightId, createdAt);
    } catch (error) {
      console.error("Failed to delete highlight:", error);
    }
  };

  const scrollToHighlight = (highlight: Highlight) => {
    const container = document.getElementById("article-content-id");
    if (!container) return;

    const highlightElement = container.querySelector(
      `article-highlight[data-highlight-id="${highlight.id}"]`
    );

    if (highlightElement) {
      highlightElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      console.warn("Highlight element not found:", highlight.id);
    }
  };

  const handleEditNote = () => {
    setIsEditingNote(true);
    setTimeout(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length
        );
      }
    }, 0);
  };

  const handleSaveNote = async () => {
    if (!article?.id) return;

    try {
      const createdAt = dayjs().valueOf();
      await updateArticle(article.id, {
        note: noteContent,
        updateAt: createdAt,
      });
      LocalStorageService.updateLastUpdateTime(createdAt);
      await ArticleService.saveArticleNote({
        articleId: article.id,
        note: noteContent,
        savedAt: createdAt,
      });
      setOriginalNote(noteContent);
      setIsEditingNote(false);
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleCancelNote = () => {
    setNoteContent(originalNote);
    setIsEditingNote(false);
  };

  const handleEditHighlightNote = (highlight: Highlight) => {
    setEditingHighlightId(highlight.id);
    setHighlightNoteContent(highlight.note || "");
  };

  const handleSaveHighlightNote = async (highlightId: string) => {
    try {
      await updateHighlight(highlightId, {
        note: highlightNoteContent,
        updatedAt: dayjs().valueOf(),
      });
      const savedAt = dayjs().valueOf();
      LocalStorageService.updateLastUpdateTime(savedAt);
      await HighlightService.saveHighlightNote({
        highlightId,
        note: highlightNoteContent,
        savedAt,
      });
      setEditingHighlightId(null);
      setHighlightNoteContent("");
    } catch (error) {
      console.error("Failed to save highlight note:", error);
    }
  };

  const handleCancelHighlightNote = (originalNote: string) => {
    setHighlightNoteContent(originalNote);
    setEditingHighlightId(null);
  };

  useEffect(() => {
    if (r_sidebar_state && !open) {
      toggleSidebar();
    } else if (!r_sidebar_state && open) {
      toggleSidebar();
    }
  }, [r_sidebar_state, open, toggleSidebar]);

  // Handle switching to chat tab when Ask Rehi is clicked
  const shouldSwitchToChat = useArticleChatStore(
    (state) => state.shouldSwitchToChat
  );
  const setShouldSwitchToChat = useArticleChatStore(
    (state) => state.setShouldSwitchToChat
  );

  useEffect(() => {
    if (shouldSwitchToChat) {
      setActiveTab("chat");
      setShouldSwitchToChat(false);
    }
  }, [shouldSwitchToChat, setShouldSwitchToChat]);

  return (
    <Sidebar
      side="right"
      className="border-l bg-neutral-950 text-neutral-200 w-[340px] flex flex-col"
    >
      <SidebarContent className="p-0 flex flex-col h-full">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <TabsList className="flex w-full bg-transparent border-b border-neutral-800 text-neutral-400">
            <TabsTrigger
              value="info"
              className="flex-1 text-sm font-medium data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-r-2xl"
            >
              Info
            </TabsTrigger>
            <TabsTrigger
              value="notebook"
              className="flex-1 text-sm font-medium data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-r-2xl"
            >
              Notebook
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex-1 text-sm font-medium data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-r-2xl"
            >
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full px-4 py-3 [&_[data-slot=scroll-area-scrollbar]]:!hidden [&_[data-slot=scroll-area-viewport]]:scrollbar-hide">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">
                  {article?.title ?? "None"}
                </h2>
                <a
                  href={article?.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-400 hover:underline break-words"
                >
                  {article?.url ?? "None"}
                </a>
                <p className="text-xs text-neutral-400">
                  By {article?.author ?? "None"}
                </p>

                <Separator className="bg-neutral-800" />

                <div>
                  <h3 className="uppercase text-[10px] text-neutral-500 font-medium mb-1">
                    Summary
                  </h3>
                  <p className="text-sm leading-relaxed">
                    {article?.summary ??
                      "No summary available for this article."}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="uppercase text-[10px] text-neutral-500 font-medium mb-1">
                    Details
                  </h3>
                  <div className="text-sm space-y-4 w-full">
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-4 w-20">
                        <span className="text-neutral-400">Type:</span>
                        <span className="text-neutral-400">Domain:</span>
                        <span className="text-neutral-400">Published:</span>
                        <span className="text-neutral-400">Length:</span>
                        <span className="text-neutral-400">Progress:</span>
                        <span className="text-neutral-400">Language:</span>
                      </div>
                      <div className="flex flex-col gap-4 flex-1">
                        <span>{article ? "Article" : "None"}</span>
                        <span>
                          {article?.url
                            ? new URL(article.url).hostname
                            : "None"}
                        </span>
                        <span>
                          {article?.createAt
                            ? new Date(article.createAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "None"}
                        </span>
                        <span>{article?.timeToRead ?? "None"}</span>
                        <span>None</span>
                        <span>{getLanguageName(article?.language)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notebook" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full px-4 py-3 pr-1 [&_[data-slot=scroll-area-scrollbar]]:!hidden [&_[data-slot=scroll-area-viewport]]:scrollbar-hide">
              <div className="space-y-6">
                {/* Document Note Input/Display */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="uppercase text-xs text-neutral-500 font-semibold tracking-wider">
                      Document Note
                    </h3>
                    {!isEditingNote && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditNote}
                        className="h-6 w-6 p-0 hover:bg-neutral-700"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-2">
                      <Textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Add your notes about this article..."
                        className="bg-neutral-800 border-neutral-700 text-neutral-300 min-h-[100px] resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelNote}
                          className="h-7 px-2 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveNote}
                          className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="bg-neutral-800 p-3 rounded-md min-h-[60px] cursor-pointer hover:bg-neutral-750 transition-colors"
                      onClick={handleEditNote}
                    >
                      <p className="text-sm text-neutral-300 whitespace-pre-wrap">
                        {article?.note ||
                          "Click to add notes about this article..."}
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="bg-neutral-800" />

                {/* Highlights List */}
                <div>
                  <h3 className="uppercase text-xs text-neutral-500 font-semibold mb-3 tracking-wider">
                    Highlights ({highlights?.length || 0})
                  </h3>
                  {highlights && highlights.length > 0 ? (
                    <ul className="space-y-3">
                      {highlights.map((highlight) => (
                        <li
                          key={highlight.id}
                          className="group border-l-4 border-blue-600 pl-3 py-2 hover:bg-neutral-800/50 rounded-r-md transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => scrollToHighlight(highlight)}
                            >
                              <p className="text-sm text-neutral-300 leading-relaxed">
                                {highlight.text}
                              </p>
                              {editingHighlightId === highlight.id ? (
                                <div className="mt-2 space-y-2">
                                  <Textarea
                                    value={highlightNoteContent}
                                    onChange={(e) =>
                                      setHighlightNoteContent(e.target.value)
                                    }
                                    placeholder="Add your note..."
                                    className="bg-neutral-800 border-neutral-700 text-neutral-300 min-h-[80px] resize-none text-sm"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelHighlightNote(
                                          highlight.note || ""
                                        );
                                      }}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveHighlightNote(highlight.id);
                                      }}
                                      className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Save className="w-3 h-3 mr-1" />
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="mt-2 group/note"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {highlight.note ? (
                                    <div className="bg-neutral-900/50 p-2 rounded border border-neutral-700 relative">
                                      <div className="absolute top-1 right-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleEditHighlightNote(highlight)
                                          }
                                          className="h-5 w-5 p-0 hover:bg-neutral-700"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <p className="text-xs text-neutral-400 mb-1 font-semibold">
                                        Note:
                                      </p>
                                      <p className="text-sm text-neutral-300 leading-relaxed pr-6">
                                        {highlight.note}
                                      </p>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleEditHighlightNote(highlight)
                                      }
                                      className="mt-2 w-full bg-neutral-900/50 p-2 rounded border border-neutral-700 text-xs text-neutral-400 hover:bg-neutral-800 transition-colors flex items-center gap-2"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      Click to add a note
                                    </button>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-neutral-500">
                                  {highlight.createBy === "rehi-web"
                                    ? "Web"
                                    : "Extension"}
                                </span>
                                {highlight.color && (
                                  <div
                                    className="w-3 h-3 rounded-full border border-neutral-600"
                                    style={{
                                      backgroundColor: highlight.color,
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHighlight(highlight.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                              title="Delete highlight"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                      <p className="text-sm text-neutral-500">
                        No highlights recorded yet.
                      </p>
                      <p className="text-xs text-neutral-600 mt-1">
                        Select text in the article to create highlights.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="chat"
            className="flex-1 min-h-0 mt-0 p-0 -mx-4 -my-3 flex flex-col"
          >
            <div className="flex-1 min-h-0 px-4 flex flex-col">
              <ArticleChat articleId={article?.id || ""} />
            </div>
          </TabsContent>
        </Tabs>
      </SidebarContent>
    </Sidebar>
  );
}
