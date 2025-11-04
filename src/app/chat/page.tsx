"use client";
import { Send, Bot, User, Trash2 } from "lucide-react";
import React from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatService, ChatHistoryMessage } from "@/services/chat-service";
import { db } from "@/db/db";
import { useRouter } from "next/navigation";
import { ChatHistoryPanel } from "@/components/chat-history-panel";
import {
  ChatSessionService,
  ChatMessage,
} from "@/services/chat-session-service";

// Types
interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface RelevantPreviewItem {
  articleId: string;
  title: string;
  imagePreviewUrl: string;
  content: string;
}

// Dark mode is enforced across the app; no toggle needed.

// Message bubble component with enhanced styling
function MessageBubble({
  message,
  isDark,
}: {
  message: Message;
  isDark: boolean;
}) {
  return (
    <div
      className={`flex ${
        message.isUser ? "justify-end mr-[5px]" : "justify-start ml-[5px]"
      } mb-4 group animate-slideUp`}
    >
      <div className="flex items-end space-x-2 max-w-[95%]">
        {!message.isUser && (
          <div className="w-8 h-8 rounded-full overflow-hidden mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/robo%20doggo.png"
              alt="Rehi Bot"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col">
          {message.isUser ? (
            <div
              className={`px-6 py-4 rounded-3xl shadow-sm transition-all duration-200 hover:shadow-md rounded-br-md text-white ${
                isDark
                  ? "bg-gray-700 shadow-black/20"
                  : "bg-gray-200 text-gray-900 shadow-gray-400/20"
              }`}
            >
              <p className="break-words whitespace-pre-line leading-relaxed">
                {message.text}
              </p>
            </div>
          ) : (
            <div className="break-words leading-relaxed prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({
                    inline,
                    children,
                    ...props
                  }: { inline?: boolean; children?: React.ReactNode } & any) {
                    return inline ? (
                      <code
                        className={`px-1 py-0.5 rounded ${
                          isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <pre
                        className={`overflow-x-auto p-3 rounded border ${
                          isDark
                            ? "bg-black/40 border-gray-700"
                            : "bg-gray-100 border-gray-200"
                        }`}
                      >
                        <code {...props}>{children}</code>
                      </pre>
                    );
                  },
                  a({
                    children,
                    ...props
                  }: { children?: React.ReactNode } & any) {
                    return (
                      <a
                        className="underline decoration-dotted hover:decoration-solid text-blue-400 hover:text-blue-300"
                        target="_blank"
                        rel="noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  ul({
                    children,
                    ...props
                  }: { children?: React.ReactNode } & any) {
                    return (
                      <ul className="list-disc pl-5 space-y-1" {...props}>
                        {children}
                      </ul>
                    );
                  },
                  ol({
                    children,
                    ...props
                  }: { children?: React.ReactNode } & any) {
                    return (
                      <ol className="list-decimal pl-5 space-y-1" {...props}>
                        {children}
                      </ol>
                    );
                  },
                  blockquote({
                    children,
                    ...props
                  }: { children?: React.ReactNode } & any) {
                    return (
                      <blockquote
                        className={`border-l-4 pl-3 italic ${
                          isDark ? "border-gray-600" : "border-gray-300"
                        }`}
                        {...props}
                      >
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}

          <span
            className={`text-xs mt-2 px-2 ${
              message.isUser
                ? "text-right text-blue-400"
                : isDark
                ? "text-gray-500"
                : "text-gray-400"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {message.isUser && (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDark ? "bg-gray-600" : "bg-gray-400"
            } mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          >
            <User size={16} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced typing indicator
function TypingIndicator({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex justify-start mb-4 animate-slideUp">
      <div className="flex items-end space-x-2">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/robo%20doggo.png"
            alt="Rehi Bot"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className={`px-6 py-4 rounded-3xl rounded-bl-md shadow-sm ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <div className="flex space-x-2">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                isDark ? "bg-gray-400" : "bg-gray-500"
              }`}
              style={{ animationDelay: "0s" }}
            />
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                isDark ? "bg-gray-400" : "bg-gray-500"
              }`}
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                isDark ? "bg-gray-400" : "bg-gray-500"
              }`}
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Convert ChatMessage to Message
const chatMessageToMessage = (msg: ChatMessage): Message => ({
  id: msg.id,
  text: msg.text,
  isUser: msg.isUser,
  timestamp: msg.timestamp,
});

// Convert Message to ChatMessage
const messageToChatMessage = (msg: Message): ChatMessage => ({
  id: msg.id,
  text: msg.text,
  isUser: msg.isUser,
  timestamp: msg.timestamp,
});

function ChatBot() {
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(
    null
  );
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = React.useState(false);
  const isDark = true;
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [relevantPreviews, setRelevantPreviews] = React.useState<
    RelevantPreviewItem[]
  >([]);

  // Load session on mount or when session ID changes
  React.useEffect(() => {
    const loadSession = () => {
      let sessionId =
        currentSessionId || ChatSessionService.getCurrentSessionId();

      if (!sessionId) {
        // Create new session if none exists
        const newSession = ChatSessionService.createSession();
        sessionId = newSession.id;
      }

      const session = ChatSessionService.getSession(sessionId!);
      if (session) {
        setCurrentSessionId(sessionId!);
        ChatSessionService.setCurrentSessionId(sessionId!);
        setMessages(session.messages.map(chatMessageToMessage));
      } else {
        // Create new session if current one doesn't exist
        const newSession = ChatSessionService.createSession();
        setCurrentSessionId(newSession.id);
        setMessages(newSession.messages.map(chatMessageToMessage));
      }
    };

    loadSession();
  }, [currentSessionId]);

  // Save messages to session whenever they change
  React.useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      ChatSessionService.updateSession(currentSessionId, {
        messages: messages.map(messageToChatMessage),
      });
    }
  }, [messages, currentSessionId]);

  // Handle new chat
  const handleNewChat = () => {
    const newSession = ChatSessionService.createSession();
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages.map(chatMessageToMessage));
    setRelevantPreviews([]);
  };

  // Handle select session
  const handleSelectSession = (sessionId: string) => {
    const session = ChatSessionService.getSession(sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      ChatSessionService.setCurrentSessionId(sessionId);
      setMessages(session.messages.map(chatMessageToMessage));
      setRelevantPreviews([]);
    }
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const userInput = input.trim();
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Update session title from first user message if it's still "New Chat"
    if (currentSessionId && messages.filter((m) => m.isUser).length === 0) {
      ChatSessionService.updateSessionTitleFromMessage(
        currentSessionId,
        userInput
      );
    }

    try {
      // Build history from existing messages
      const history: ChatHistoryMessage[] = messages.map((m) => ({
        role: m.isUser ? "user" : "assistant",
        content: m.text,
      }));

      const response = await ChatService.chatWithHistory(userInput, history);

      const answer = (response as any)?.data?.answer ?? "";
      const relevantDocuments =
        (response as any)?.data?.relevantDocuments ?? [];

      const botMessage: Message = {
        id: Date.now() + 1,
        text: answer || "(No answer returned)",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, botMessage]);

      // Load article previews for relevant documents
      if (Array.isArray(relevantDocuments) && relevantDocuments.length > 0) {
        try {
          const previews: RelevantPreviewItem[] = [];
          for (const doc of relevantDocuments) {
            const articleId = String(doc?.articleId || "");
            if (!articleId) continue;
            const article = await db.articles.get(articleId);
            if (!article) continue;
            previews.push({
              articleId,
              title: article.title,
              imagePreviewUrl: article.imagePreviewUrl || "/article_image.png",
              content: String(doc?.content || ""),
            });
          }
          setRelevantPreviews(previews);
        } catch (e) {
          setRelevantPreviews([]);
        }
      } else {
        setRelevantPreviews([]);
      }
    } catch (err) {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, something went wrong while contacting the AI.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, botMessage]);
      setRelevantPreviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (!currentSessionId) return;
    if (!confirm("Clear all messages in this chat?")) return;

    const clearedMessages = [
      {
        id: 1,
        text: "Chat cleared! How can I help you today?",
        isUser: false,
        timestamp: new Date(),
      },
    ];
    setMessages(clearedMessages);
    ChatSessionService.updateSession(currentSessionId, {
      messages: clearedMessages.map(messageToChatMessage),
    });
    setRelevantPreviews([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex w-full h-screen bg-background">
      {/* Chat History Panel */}
      <ChatHistoryPanel
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isCollapsed={isHistoryCollapsed}
        onToggleCollapse={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Bar */}
        <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/robo%20doggo.png"
                  alt="Rehi Bot"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Rehi chat</h1>
                <p className="text-sm text-muted-foreground">
                  Find everything you read here.
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              aria-label="Clear chat"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        {/* Main Layout - Grid with 2 columns on large screens */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
          {/* Left Column - Chat Messages */}
          <div className="flex flex-col overflow-hidden">
            {/* Messages Container - Scrollable */}
            <div className="flex-1 overflow-y-auto px-3 py-6">
              <div className="w-full space-y-2">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} isDark={isDark} />
                ))}
                {isLoading && <TypingIndicator isDark={isDark} />}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Fixed at bottom of left column */}
            <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-3 py-4">
              <div className="w-full">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                    disabled={isLoading}
                    className="w-full resize-none py-4 px-6 pr-16 rounded-2xl bg-muted text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 shadow-sm scrollbar-hide"
                    style={{ maxHeight: "120px" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 bottom-3 w-10 h-10 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/70"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 px-2 text-muted-foreground">
                  <p className="text-xs">
                    {messages.length} message{messages.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                      Enter
                    </kbd>{" "}
                    to send
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Relevant Documents Panel */}
          <aside className="hidden lg:flex flex-col border-l border-border bg-card/60 overflow-hidden">
            <div className="flex-shrink-0 px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium">Relevant documents</h2>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {relevantPreviews.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No related content yet
                </div>
              ) : (
                relevantPreviews.map((item, index) => (
                  <button
                    key={`${item.articleId}-${index}`}
                    onClick={() => router.push(`/articles/${item.articleId}`)}
                    className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imagePreviewUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-xs mt-1 line-clamp-3 text-muted-foreground">
                          {item.content}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>

        {/* Custom styles */}
        <style jsx>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: ${isDark ? "#374151" : "#f3f4f6"};
            border-radius: 3px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: ${isDark ? "#6b7280" : "#d1d5db"};
            border-radius: 3px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? "#9ca3af" : "#9ca3af"};
          }
        `}</style>
      </div>
    </div>
  );
}

function ChatPage() {
  return <ChatBot />;
}

export default withPageAuthRequired(ChatPage);
