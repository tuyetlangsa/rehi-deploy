"use client";

import React from "react";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatService, ChatHistoryMessage } from "@/services/chat-service";
import { ArticleChatHistoryService } from "@/services/article-chat-history-service";
import { useArticleChatStore } from "@/store/article-chat-store";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ArticleChatProps {
  articleId: string;
  isDark?: boolean;
}

// Message bubble component - only user messages have bubbles
function MessageBubble({
  message,
  isDark = true,
}: {
  message: Message;
  isDark?: boolean;
}) {
  if (message.isUser) {
    // User message - with bubble
    return (
      <div className="flex justify-end mr-[5px] mb-3 group">
        <div className="flex items-end space-x-2 max-w-[95%]">
          <div className="flex flex-col items-end">
            <div className="px-4 py-2.5 rounded-2xl shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md">
              <p className="break-words whitespace-pre-line leading-relaxed text-sm">
                {message.text}
              </p>
            </div>
          </div>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isDark ? "bg-blue-600" : "bg-blue-500"
            } mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0`}
          >
            <User size={12} className="text-white" />
          </div>
        </div>
      </div>
    );
  }

  // Bot message - plain text, no bubble
  return (
    <div className="flex justify-start ml-[5px] mb-3">
      <div className="w-full max-w-[95%]">
        <div className="break-words leading-relaxed text-sm text-neutral-300">
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
                    className={`px-1 py-0.5 rounded text-xs bg-neutral-800 text-neutral-200`}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    className={`overflow-x-auto p-2 rounded border text-xs bg-neutral-900 border-neutral-800 text-neutral-200`}
                  >
                    <code {...props}>{children}</code>
                  </pre>
                );
              },
              a({ children, ...props }: { children?: React.ReactNode } & any) {
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
              ul({ children, ...props }: { children?: React.ReactNode } & any) {
                return (
                  <ul className="list-disc pl-4 space-y-1 text-sm" {...props}>
                    {children}
                  </ul>
                );
              },
              ol({ children, ...props }: { children?: React.ReactNode } & any) {
                return (
                  <ol
                    className="list-decimal pl-4 space-y-1 text-sm"
                    {...props}
                  >
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
                    className="border-l-4 pl-2 italic text-sm border-neutral-700"
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
      </div>
    </div>
  );
}

// Typing indicator - no bubble, just dots
function TypingIndicator({ isDark = true }: { isDark?: boolean }) {
  return (
    <div className="flex justify-start mb-3 ml-[5px]">
      <div className="flex space-x-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isDark ? "bg-neutral-400" : "bg-neutral-500"
          }`}
          style={{ animationDelay: "0s" }}
        />
        <div
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isDark ? "bg-neutral-400" : "bg-neutral-500"
          }`}
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isDark ? "bg-neutral-400" : "bg-neutral-500"
          }`}
          style={{ animationDelay: "0.4s" }}
        />
      </div>
    </div>
  );
}

export function ArticleChat({ articleId, isDark = true }: ArticleChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const pendingQuestion = useArticleChatStore((state) => state.pendingQuestion);
  const clearPendingQuestion = useArticleChatStore(
    (state) => state.clearPendingQuestion
  );

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
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

  // Load chat history when articleId changes
  React.useEffect(() => {
    if (articleId) {
      const savedHistory = ArticleChatHistoryService.getHistory(articleId);
      setMessages(savedHistory);
    } else {
      setMessages([]);
    }
    // Don't reset input when articleId changes - keep it for better UX
  }, [articleId]);

  // Save chat history whenever messages change
  React.useEffect(() => {
    if (articleId && messages.length > 0) {
      ArticleChatHistoryService.saveHistory(articleId, messages);
    }
  }, [messages, articleId]);

  const sendMessage = async (questionText?: string) => {
    const question = questionText || input.trim();
    if (!question || isLoading || !articleId) return;

    const userMessage: Message = {
      id: Date.now(),
      text: question,
      isUser: true,
      timestamp: new Date(),
    };

    const userInput = question;
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!questionText) {
      setInput(""); // Only clear input if it was sent from input field
    }
    setIsLoading(true);

    try {
      // Build history from existing messages
      const history: ChatHistoryMessage[] = messages.map((m) => ({
        role: m.isUser ? "user" : "assistant",
        content: m.text,
      }));

      const response = await ChatService.chatWithArticle(
        articleId,
        userInput,
        history
      );

      const answer = (response as any)?.data?.answer ?? "";

      const botMessage: Message = {
        id: Date.now() + 1,
        text: answer || "(No answer returned)",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, botMessage]);
    } catch (err) {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, something went wrong while contacting the AI.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pending question from selection menu - set it to input area instead of sending
  React.useEffect(() => {
    if (pendingQuestion && articleId) {
      setInput(pendingQuestion);
      clearPendingQuestion();
      // Focus the textarea after setting the input
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [pendingQuestion, articleId, clearPendingQuestion]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-2 py-3 mb-2 min-h-0 scrollbar-hide">
        {" "}
        <div className="space-y-2">
          {messages.length === 0 && (
            <div className="text-sm text-neutral-400 text-center py-4">
              Ask me anything about this article
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isDark={isDark} />
          ))}
          {isLoading && <TypingIndicator isDark={isDark} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-neutral-800 pt-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this article..."
            disabled={isLoading}
            className="w-full resize-none py-2 px-3 pr-10 rounded-lg bg-neutral-900 text-neutral-200 border border-neutral-800 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 text-sm scrollbar-hide"
            style={{ maxHeight: "100px" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 w-7 h-7 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
