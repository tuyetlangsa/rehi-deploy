import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const revision = process.env.NEXT_PUBLIC_BUILD_ID ?? String(Date.now());

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  // Only precache routes that return 200 without a session. Auth-gated,
  // server-rendered routes (/articles, /tags, /trash, /review, /profile,
  // /settings) return 500 unauthenticated; including them makes the Serwist
  // install precache (addAll) reject, so the SW never activates and the whole
  // app breaks offline (ERR_FAILED). Those routes are covered offline by
  // cacheOnNavigation (once visited online) + the /~offline fallback, and
  // articles render via the /~offline-article shell from IndexedDB.
  additionalPrecacheEntries: [
    { url: "/~offline", revision },
    { url: "/~offline-article", revision },
    { url: "/", revision },
  ],
});

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/library",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/guide",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default withSerwist(nextConfig);
