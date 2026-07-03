import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const revision = process.env.NEXT_PUBLIC_BUILD_ID ?? String(Date.now());

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  additionalPrecacheEntries: [
    { url: "/~offline", revision },
    { url: "/~offline-article", revision },
    { url: "/", revision },
    { url: "/articles", revision },
    { url: "/tags", revision },
    { url: "/trash", revision },
    { url: "/review", revision },
    { url: "/profile", revision },
    { url: "/settings", revision },
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
