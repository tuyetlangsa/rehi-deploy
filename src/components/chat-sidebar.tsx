"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import {
  ChatSessionService,
  ChatSession,
} from "@/services/chat-session-service";
import { useEffect, useState } from "react";

interface ChatSidebarProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  currentSessionId,
  onSelectSession,
  onNewChat,
}: ChatSidebarProps) {
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

  return (
    <Sidebar collapsible="icon" className="dark text-white border-none">
      <SidebarHeader className="p-4 border-b border-border">
        <SidebarMenuButton
          onClick={onNewChat}
          className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus size={16} />
          <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {sessions.map((session) => (
            <SidebarMenuItem key={session.id}>
              <div className="group flex items-center w-full">
                <SidebarMenuButton
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full justify-start ${
                    currentSessionId === session.id
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <MessageSquare size={16} />
                  <span className="group-data-[collapsible=icon]:hidden flex-1 truncate text-left">
                    {session.title}
                  </span>
                </SidebarMenuButton>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
                  aria-label="Delete chat"
                >
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </div>
            </SidebarMenuItem>
          ))}
          {sessions.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No chats yet. Start a new chat!
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
