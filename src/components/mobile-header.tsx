"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";

export function MobileHeader() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // Don't show on articles page as it has its own navbar with trigger
  if (!isMobile || pathname?.startsWith("/articles")) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
      <SidebarTrigger className="cursor-pointer" />
    </div>
  );
}
