import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "REHI",
    short_name: "REHI",
    description: "A Progressive Web App built with Next.js",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/logo192_black.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo512_black.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshot.png",
        sizes: "2560x1440",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
