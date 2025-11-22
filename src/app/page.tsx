"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  Instagram,
  Linkedin,
  Spool,
  Twitter,
  Facebook,
  Menu,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0";
import { useSubscriptionStore } from "@/store/subscription-store";
import { Button } from "@/components/ui/button";
import { PRICING_DATA } from "@/constants/data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface PricingPlan {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  features: readonly string[];
}

const NAVIGATION_ITEMS = [
  { label: "Overview", href: "/landing" },
  { label: "Library", href: "/library" },
  { label: "Guide", href: "/guide" },
  { label: "Chat AI", href: "/chat" },
  { label: "Extension", href: "/extension" },
] as const;

const FOOTER_LINKS = {
  company: ['About "Rehi"', "Terms of Service", "Privacy Policy"],
  support: ["FAQs", "Contact Us", "Notice"],
} as const;

const SOCIAL_ICONS = [Instagram, Facebook, Spool, Twitter, Linkedin] as const;

// Optimized components
const PricingCard = ({ plan }: { plan: PricingPlan }) => {
  const { subscription } = useSubscriptionStore();
  const router = useRouter();

  const isSubscribed = subscription && subscription.id === plan.id;

  const handleSubscribe = () => {
    router.push("/subscription");
  };

  return (
    <div className="relative w-full max-w-[305px] h-auto min-h-[400px] sm:max-h-[447px] py-4 sm:py-4.5 px-4 sm:px-4.5 flex flex-col justify-between border border-gray-200 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col justify-start gap-2">
        <h3 className="text-home-title2 text-[#4A6ABF]">{plan.title}</h3>
        <p className="text-home-mini pr-5">{plan.subtitle}</p>
      </div>

      <ul className="flex flex-col gap-2.5 text-lib-subhead1 leading-5">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex flex-row gap-3">
            <span>•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-row justify-between items-center">
        <p className="font-semibold">{plan.price}</p>
        {plan.id !== "3fa85f64-5717-4562-b3fc-2c963f66afa6" && (
          <Button
            disabled={isSubscribed ?? false}
            onClick={handleSubscribe}
            className={`px-4 py-2 rounded transition-all duration-200 ${
              isSubscribed
                ? "bg-gray-500 text-white border border-gray-500 cursor-default"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300"
            }`}
          >
            {isSubscribed ? "Subscribed" : "Subscribe Now"}
          </Button>
        )}
      </div>
    </div>
  );
};

const PricingSection = ({ data }: { data: readonly PricingPlan[] }) => (
  <div className="flex flex-row justify-center gap-4 sm:gap-6 flex-wrap px-4 sm:px-0">
    {data.map((plan, index) => (
      <PricingCard key={`${plan.title}-${index}`} plan={plan} />
    ))}
  </div>
);

const Header = () => {
  const { user, isLoading } = useUser();
  const [jwt, setJwt] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchToken() {
      const token = await getAccessToken();
      setJwt(token);
    }
    fetchToken();
  });

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
          {NAVIGATION_ITEMS.map((item) => (
            // For the Extension item we want to trigger a direct download of the
            // packaged extension stored in the `public/` folder. Use a plain
            // <a> with the `download` attribute so browsers will download the zip
            // instead of navigating to a route.
            item.href === "/extension" ? (
              <a
                key={item.href}
                href="/chrome-mv3-prod.zip"
                download="chrome-mv3-prod.zip"
                className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </Link>
            )
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
              <span></span>
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
                {NAVIGATION_ITEMS.map((item) => (
                  item.href === "/extension" ? (
                    <a
                      key={item.href}
                      href="/chrome-mv3-prod.zip"
                      download="chrome-mv3-prod.zip"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-blue-400 transition-colors duration-200 text-base font-medium py-2"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-blue-400 transition-colors duration-200 text-base font-medium py-2"
                    >
                      {item.label}
                    </Link>
                  )
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
};

const FooterSection = ({
  title,
  links,
}: {
  title: string;
  links: readonly string[];
}) => (
  <div>
    <h3 className="font-semibold mb-6 text-blue-400">{title}</h3>
    <ul className="space-y-3.5 text-lib-subhead1">
      {links.map((item) => (
        <li key={item}>
          <a
            href="#"
            className="text-white hover:text-gray-400 transition-colors duration-200"
          >
            {item}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer className="bg-[#121212] text-white py-8 sm:py-12 md:py-16">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        <div className="col-span-1">
          <Image
            src="/icons/rehi.svg"
            alt="REHI Logo"
            width={115}
            height={60}
            className="mb-6"
          />
          <p className="text-gray-400 text-sm leading-relaxed">
            Read, REHI and remember it! Transform your learning experience with
            AI-powered notes and intelligent flashcards.
          </p>
        </div>

        <FooterSection title="Company" links={FOOTER_LINKS.company} />
        <FooterSection title="Support" links={FOOTER_LINKS.support} />

        <div className="flex space-x-4">
          {SOCIAL_ICONS.map((Icon, index) => (
            <Icon
              key={index}
              className="text-white hover:text-gray-400 transition-colors duration-200 cursor-pointer"
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
        <p className="text-gray-400 text-xs sm:text-sm">
          © 2024 REHI. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default function Home() {
  const { subscription, fetch } = useSubscriptionStore();

  useEffect(() => {
    if (!subscription) {
      fetch();
    }
  }, [subscription, fetch]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="flex flex-col">
        <section className="py-8 sm:py-12">
          <div className="container mx-auto text-center px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight">
              The best REHI experience with our value Bundles!
            </h1>
          </div>
        </section>

        <Suspense
          fallback={<div className="flex justify-center py-16">Loading...</div>}
        >
          <PricingTabsSection />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

function PricingTabsSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") || "monthly";

  const handleChangeTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("plan", tab);
    router.push(`?${params.toString()}`);
  };

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-center">
          <Tabs
            value={plan}
            onValueChange={handleChangeTab}
            defaultValue="monthly"
            className="w-full"
          >
            <div className="flex justify-center mb-8 sm:mb-12">
              <TabsList className="grid w-full max-w-[400px] h-12 sm:h-14 grid-cols-2">
                <TabsTrigger className="cursor-pointer" value="monthly">
                  Monthly
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="yearly">
                  Yearly
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="monthly">
              <PricingSection data={PRICING_DATA.monthly} />
            </TabsContent>
            <TabsContent value="yearly">
              <PricingSection data={PRICING_DATA.yearly} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
