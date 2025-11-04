import type { Metadata } from "next";
import { Shippori_Antique } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { SyncProvider } from "@/components/sync-provider";

const shipporiAntique = Shippori_Antique({
  variable: "--font-shippori-antique",
  subsets: ["latin"],
  weight: "400",
});

export const viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "REHI - Your Knowledge Hub",
  description: "A Progressive Web App for managing and reading articles",
  manifest: "/manifest.json",
  // themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "REHI",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "REHI",
    title: "REHI - Your Knowledge Hub",
    description: "A Progressive Web App for managing and reading articles",
  },
  twitter: {
    card: "summary",
    title: "REHI - Your Knowledge Hub",
    description: "A Progressive Web App for managing and reading articles",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${shipporiAntique.variable} antialiased`}>
        <SyncProvider>
          <Providers>{children}</Providers>
        </SyncProvider>
      </body>
    </html>
  );
}
