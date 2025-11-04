"use client";

import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  ChatSessionService,
  ChatSession,
} from "@/services/chat-session-service";
import { useEffect, useState } from "react";

interface ChatHistoryPanelProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatHistoryPanel({
  currentSessionId,
  onSelectSession,
  onNewChat,
  isCollapsed = false,
  onToggleCollapse,
}: ChatHistoryPanelProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const loadSessions = () => {
    setSessions(ChatSessionService.getAllSessions());
  };

  useEffect(() => {
    loadSessions();
    // Listen for storage changes (when sessions are updated)
    const handleStorageChange = () => {
      loadSessions();
    };
    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for changes from same tab
    const interval = setInterval(loadSessions, 500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm("Delete this chat?")) {
      ChatSessionService.deleteSession(sessionId);
      loadSessions();
      if (currentSessionId === sessionId) {
        const remaining = ChatSessionService.getAllSessions();
        if (remaining.length > 0) {
          onSelectSession(remaining[0].id);
        } else {
          onNewChat();
        }
      }
    }
  };

  if (isCollapsed) {
    return (
      <aside className="flex-shrink-0 w-16 border-r border-border bg-card/60 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-muted transition-colors mb-4"
          aria-label="Expand chat history"
        >
          <PanelLeftOpen size={20} />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          aria-label="New Chat"
        >
          <Plus size={20} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex-shrink-0 w-[280px] border-r border-border bg-card/60 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-sm">Chat History</h2>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Collapse chat history"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No chats yet. Start a new chat!
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group relative flex items-center w-full"
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentSessionId === session.id
                      ? "bg-muted font-medium"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="flex-1 truncate text-left">
                    {session.title}
                  </span>
                </button>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
                  aria-label="Delete chat"
                >
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
