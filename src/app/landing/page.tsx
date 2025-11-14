"use client";
import Image from "next/image";
import Link from "next/link";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="bg-[#0D0D0D] text-white h-16 sm:h-20 md:h-24 flex items-center sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center h-full w-full">
        <Image
          src="/icons/rehi.svg"
          alt="REHI Logo"
          width={115}
          height={60}
          className="h-8 sm:h-10 md:h-auto w-auto"
        />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
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

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <Image
                src={user.picture || "/default-avatar.png"}
                alt={user.name || "User Avatar"}
                width={28}
                height={28}
                className="rounded-full"
              />
            </div>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-gray-800"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] bg-[#0D0D0D] text-white border-gray-800"
            >
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-blue-400 transition-colors duration-200 text-base font-medium py-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-gray-800 pt-4 mt-4">
                  {isLoading ? (
                    <p className="text-gray-400">Loading...</p>
                  ) : user ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.picture || "/default-avatar.png"}
                          alt={user.name || "User Avatar"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="text-sm text-gray-300">
                          {user.email}
                        </span>
                      </div>
                      <a
                        href="/auth/logout"
                        onClick={() => setMobileMenuOpen(false)}
                        className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
                      >
                        Log Out
                      </a>
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
                    >
                      Log In
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <Header />
      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Read smarter. Remember longer. Rehi your knowledge.
            </h1>
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-neutral-300">
              Rehi is an AI-powered knowledge companion that helps you save
              articles, highlight effortlessly, chat with your readings, and
              master what you learn with flashcards.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              <Link
                href="/guide"
                className="inline-flex items-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
              >
                Get Started
              </Link>
              <Link
                href="/public/articles"
                className="inline-flex items-center rounded-md border border-neutral-700 px-5 py-3 text-sm font-semibold hover:bg-neutral-900"
              >
                Explore Public Articles
              </Link>
            </div>
          </div>
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
            <Image
              src="/preview_library.png"
              alt="Rehi preview"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">
          What Rehi can do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            title="Save & Organize Articles"
            desc="Capture articles from the web, tag them, and keep your reading organized across Reading/Later/Archived."
            href="/articles"
            cta="Open Library"
          />
          <FeatureCard
            title="Smart Highlighting"
            desc="Highlight key insights with colors and notes. Your highlights sync and are easy to review."
            href="/guide#highlighting"
            cta="Learn Highlighting"
          />
          <FeatureCard
            title="Chat with Your Articles"
            desc="Ask questions about what you read. Rehi chats using your saved content to give contextual answers."
            href="/chat"
            cta="Try Chat AI"
          />
          <FeatureCard
            title="Flashcards & Review"
            desc="Turn highlights into spaced‑repetition flashcards and build long‑term memory effortlessly."
            href="/guide#flashcards"
            cta="See How It Works"
          />
          <FeatureCard
            title="Public Articles"
            desc="Publish an article to share with others and browse what the community has made public."
            href="/public/articles"
            cta="Browse Public"
          />
          <FeatureCard
            title="Browser Extension"
            desc="Save and highlight directly while you browse. Seamless capture into your Rehi library."
            href="/guide#extension"
            cta="Install Extension"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
          How it works
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 list-decimal list-inside text-neutral-300">
          <li className="rounded-lg border border-neutral-800 p-5 bg-neutral-950">
            Save pages to Rehi or import existing reads. Tag and organize them.
          </li>
          <li className="rounded-lg border border-neutral-800 p-5 bg-neutral-950">
            Highlight key ideas and chat with your content to deepen
            understanding.
          </li>
          <li className="rounded-lg border border-neutral-800 p-5 bg-neutral-950">
            Turn insights into flashcards and review on your schedule.
          </li>
        </ol>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-xl border border-neutral-800 p-6 sm:p-8 bg-gradient-to-b from-neutral-900 to-neutral-950 text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Ready to Rehi your reading?
          </h3>
          <p className="mt-2 text-sm sm:text-base text-neutral-300">
            Start in minutes. Bring your articles, make highlights, and let AI
            help you retain more.
          </p>
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/guide"
              className="inline-flex items-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
            >
              Read the Guide
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center rounded-md border border-neutral-700 px-5 py-3 text-sm font-semibold hover:bg-neutral-900"
            >
              Open Library
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  desc,
  href,
  cta,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-neutral-800 bg-neutral-950 p-5 hover:bg-neutral-900 transition-colors block"
    >
      <h3 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm text-neutral-300">{desc}</p>
      <span className="mt-4 inline-flex text-sm text-blue-400 group-hover:underline">
        {cta}
      </span>
    </Link>
  );
}
