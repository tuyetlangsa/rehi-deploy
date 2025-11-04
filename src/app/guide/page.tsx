"use client";

import {
  getAccessToken,
  useUser,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Overview", href: "/landing" },
  { label: "Library", href: "/library" },
  { label: "Guide", href: "/guide" },
  { label: "Chat AI", href: "/chat" },
  { label: "Extension", href: "/extension" },
] as const;

function Header() {
  const { user, isLoading } = useUser();
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      const token = await getAccessToken();
      setJwt(token);
    }
    fetchToken();
  }, []);

  useEffect(() => {
    if (jwt) {
      window.postMessage({ type: "FROM_PAGE", jwt: jwt });
    }
  }, [jwt]);

  return (
    <header className="bg-[#0D0D0D] text-white h-24 flex items-center sticky top-0 z-50">
      <div className="container mx-auto px-6 flex justify-between items-center h-full">
        <Image
          src="/icons/rehi.svg"
          alt="REHI Logo"
          width={115}
          height={60}
          className="h-auto"
        />
        <nav className="hidden md:flex items-center space-x-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
          {isLoading && <p>Loading...</p>}
          {user ? (
            <div className="flex items-center gap-x-3">
              <Image
                src={user.picture || "/default-avatar.png"}
                alt={user.name || "User Avatar"}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm">{user.email}</span>
              <a
                href="/auth/logout"
                className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
              >
                Log Out
              </a>
            </div>
          ) : (
            <div className="flex h-5 items-center gap-x-3">
              <Link
                href="/auth/login"
                className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
              >
                Log In
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function GuidePage() {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/USER_GUIDE.md")
      .then((res) => res.text())
      .then((text) => {
        setMarkdownContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load user guide:", err);
        setMarkdownContent(
          "# User Guide\n\nFailed to load user guide. Please check the USER_GUIDE.md file."
        );
        setLoading(false);
      });
  }, []);

  // Handle smooth scroll to anchor on mount or hash change
  useEffect(() => {
    if (!loading && markdownContent) {
      const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash) {
          const id = hash.substring(1);
          const element = document.getElementById(id);
          if (element) {
            const headerOffset = 80; // Account for sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }
      };

      // Handle initial hash
      setTimeout(handleHashChange, 100);

      // Handle hash changes
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, [loading, markdownContent]);

  // Extract text from ReactNode
  const extractText = (children: React.ReactNode): string => {
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    if (Array.isArray(children)) {
      return children.map(extractText).join("");
    }
    if (children && typeof children === "object" && "props" in children) {
      return extractText((children as any).props.children);
    }
    return "";
  };

  // Generate ID from heading text
  const generateId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/--+/g, "-") // Replace multiple hyphens with single
      .trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => {
                const text = extractText(children);
                const id = generateId(text);
                return (
                  <h1
                    id={id}
                    className="text-4xl font-bold text-foreground mb-6 mt-8 first:mt-0 scroll-mt-20"
                    {...props}
                  >
                    {children}
                  </h1>
                );
              },
              h2: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => {
                const text = extractText(children);
                const id = generateId(text);
                return (
                  <h2
                    id={id}
                    className="text-3xl font-semibold text-foreground mb-4 mt-8 border-b border-border pb-2 scroll-mt-20"
                    {...props}
                  >
                    {children}
                  </h2>
                );
              },
              h3: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => {
                const text = extractText(children);
                const id = generateId(text);
                return (
                  <h3
                    id={id}
                    className="text-2xl font-semibold text-foreground mb-3 mt-6 scroll-mt-20"
                    {...props}
                  >
                    {children}
                  </h3>
                );
              },
              h4: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => {
                const text = extractText(children);
                const id = generateId(text);
                return (
                  <h4
                    id={id}
                    className="text-xl font-semibold text-foreground mb-2 mt-4 scroll-mt-20"
                    {...props}
                  >
                    {children}
                  </h4>
                );
              },
              p: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <p className="text-foreground mb-4 leading-relaxed" {...props}>
                  {children}
                </p>
              ),
              ul: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <ul
                  className="list-disc pl-6 mb-4 space-y-2 text-foreground"
                  {...props}
                >
                  {children}
                </ul>
              ),
              ol: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <ol
                  className="list-decimal pl-6 mb-4 space-y-2 text-foreground"
                  {...props}
                >
                  {children}
                </ol>
              ),
              li: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <li className="text-foreground" {...props}>
                  {children}
                </li>
              ),
              code: ({
                inline,
                children,
                ...props
              }: {
                inline?: boolean;
                children?: React.ReactNode;
              } & any) => {
                if (inline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <pre
                    className="overflow-x-auto p-4 rounded-lg bg-muted border border-border mb-4"
                    {...props}
                  >
                    <code className="text-sm font-mono text-foreground">
                      {children}
                    </code>
                  </pre>
                );
              },
              a: ({
                children,
                href,
                ...props
              }: { children?: React.ReactNode; href?: string } & any) => {
                const isAnchorLink = href?.startsWith("#");
                const handleClick = (
                  e: React.MouseEvent<HTMLAnchorElement>
                ) => {
                  if (isAnchorLink && href) {
                    e.preventDefault();
                    const id = href.substring(1);
                    const element = document.getElementById(id);
                    if (element) {
                      const headerOffset = 80; // Account for sticky header
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });

                      // Update URL hash without triggering scroll
                      window.history.pushState(null, "", href);
                    }
                  }
                };

                return (
                  <a
                    href={href}
                    onClick={isAnchorLink ? handleClick : undefined}
                    className="text-blue-400 hover:text-blue-300 underline decoration-dotted hover:decoration-solid cursor-pointer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
              blockquote: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <blockquote
                  className="border-l-4 border-blue-500 pl-4 italic text-muted-foreground my-4"
                  {...props}
                >
                  {children}
                </blockquote>
              ),
              strong: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <strong className="font-semibold text-foreground" {...props}>
                  {children}
                </strong>
              ),
              em: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <em className="italic text-foreground" {...props}>
                  {children}
                </em>
              ),
              hr: ({ ...props }) => (
                <hr className="border-t border-border my-8" {...props} />
              ),
              table: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <div className="overflow-x-auto my-4">
                  <table
                    className="min-w-full border-collapse border border-border"
                    {...props}
                  >
                    {children}
                  </table>
                </div>
              ),
              th: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <th
                  className="border border-border px-4 py-2 bg-muted font-semibold text-left"
                  {...props}
                >
                  {children}
                </th>
              ),
              td: ({
                children,
                ...props
              }: { children?: React.ReactNode } & any) => (
                <td className="border border-border px-4 py-2" {...props}>
                  {children}
                </td>
              ),
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}

export default withPageAuthRequired(GuidePage);
