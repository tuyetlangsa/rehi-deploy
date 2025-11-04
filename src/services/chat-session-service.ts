// Chat session management service using localStorage

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const CHAT_SESSIONS_KEY = "rehi_chat_sessions";
const CURRENT_SESSION_KEY = "rehi_current_chat_session";

export const ChatSessionService = {
  // Get all chat sessions
  getAllSessions(): ChatSession[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CHAT_SESSIONS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Convert timestamps back to Date objects
      return parsed.map((session: any) => ({
        ...session,
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (e) {
      console.error("Failed to load chat sessions:", e);
      return [];
    }
  },

  // Get current active session ID
  getCurrentSessionId(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(CURRENT_SESSION_KEY);
    } catch (e) {
      console.error("Failed to get current session:", e);
      return null;
    }
  },

  // Set current active session ID
  setCurrentSessionId(sessionId: string) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    } catch (e) {
      console.error("Failed to set current session:", e);
    }
  },

  // Get a specific session by ID
  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions.find((s) => s.id === sessionId) || null;
  },

  // Get current session
  getCurrentSession(): ChatSession | null {
    const currentId = this.getCurrentSessionId();
    if (!currentId) return null;
    return this.getSession(currentId);
  },

  // Create a new chat session
  createSession(title?: string): ChatSession {
    const session: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      title: title || "New Chat",
      messages: [
        {
          id: 1,
          text: "Hi, I'm Rehi robo, how can I help you today? meow meow",
          isUser: false,
          timestamp: new Date(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const sessions = this.getAllSessions();
    sessions.unshift(session); // Add to beginning
    this.saveAllSessions(sessions);
    this.setCurrentSessionId(session.id);
    return session;
  },

  // Update a session (add messages, update title)
  updateSession(sessionId: string, updates: Partial<ChatSession>) {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index === -1) return;

    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.saveAllSessions(sessions);
  },

  // Delete a session
  deleteSession(sessionId: string) {
    const sessions = this.getAllSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    this.saveAllSessions(filtered);

    // If deleting current session, switch to first available or create new
    const currentId = this.getCurrentSessionId();
    if (currentId === sessionId) {
      if (filtered.length > 0) {
        this.setCurrentSessionId(filtered[0].id);
      } else {
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    }
  },

  // Save all sessions
  saveAllSessions(sessions: ChatSession[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save chat sessions:", e);
    }
  },

  // Update session title from first user message
  updateSessionTitleFromMessage(sessionId: string, firstUserMessage: string) {
    const session = this.getSession(sessionId);
    if (!session || session.title !== "New Chat") return;

    const title = firstUserMessage.slice(0, 50).trim() || "New Chat";
    this.updateSession(sessionId, { title });
  },
};
