"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useArticleHeadings } from "@/hooks/use-article-headings";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSandStateStore } from "@/store/sidebar-state";

export function ArticleSidebar() {
  const headings = useArticleHeadings();
  const [activeId, setActiveId] = useState<string>("");
  const l_sidebar_state = useSandStateStore((state) => state.l_sidebar_state);
  const {open, toggleSidebar} = useSidebar();
  const toggle_l_sidebar = useSandStateStore((state) => state.toggle_l_sidebar);

  useEffect(() => {
    if(l_sidebar_state && !open){
      toggleSidebar();
    } else if (!l_sidebar_state && open){
      toggleSidebar();
    }
  }, [l_sidebar_state, open, toggleSidebar]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 h-16 border-b border-gray-800">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <Image
            src="/icons/rehi.svg"
            alt="Logo"
            width={75}
            height={37}
            className="group-data-[collapsible=icon]:hidden transition-opacity duration-200"
            priority
          />
          <SidebarTrigger onClick={toggle_l_sidebar} className="cursor-pointer hover:bg-gray-800 rounded-md transition-colors" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 h-full overflow-hidden">
        <SidebarGroup className="h-full">
          <SidebarGroupContent className="h-full overflow-y-auto scrollbar-hide">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSub className="space-y-1">
                  {headings.map((h) => (
                    <SidebarMenuSubItem key={h.id}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={`#${h.id}`}
                          onClick={(e) => handleClick(e, h.id)}
                          style={{
                            paddingLeft: `${(h.level - 2) * 16 + 12}px`,
                          }}
                          className={cn(
                            "flex items-center py-2 rounded-md transition-all duration-200 text-gray-400 hover:text-white hover:bg-gray-800 group-data-[collapsible=icon]:justify-center",
                            activeId === h.id &&
                              "text-white bg-gray-800 font-medium border-l-2 border-blue-500"
                          )}
                        >
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {h.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
