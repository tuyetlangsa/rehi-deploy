"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Home,
  Library,
  FileText,
  Tag,
  Calendar,
  CreditCard,
  MessageCircle,
  Users,
  Trash2,
  Settings,
  ChevronRight,
  Star,
  LogOut,
  CircleUserRound,
  LayoutDashboard,
  Globe,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useUser } from "@auth0/nextjs-auth0";
import { Spinner } from "./ui/shadcn-io/spinner";

const homeItem = { title: "Home", url: "/", icon: Home };
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim());

const mainItems = [
  { title: "Daily review", url: "/review", icon: Calendar },
  { title: "Chat AI", url: "/chat", icon: MessageCircle },
  { title: "Trash", url: "/trash", icon: Trash2 },
];

const librarySubItems = [
  { title: "Articles", url: "/articles", icon: FileText },
  { title: "Tags", url: "/tags", icon: Tag },
];

function SidebarLink({
  url,
  icon: Icon,
  title,
}: {
  url: string;
  icon: React.ElementType;
  title: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === url || pathname.startsWith(`${url}/`);
  return (
    <SidebarMenuButton asChild>
      <Link
        href={url}
        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
      >
        <Icon className="h-4 w-4" />
        <span
          className={`group-data-[collapsible=icon]:hidden ${
            isActive ? "font-semibold" : ""
          }`}
        >
          {title}
        </span>
      </Link>
    </SidebarMenuButton>
  );
}

export function AppSidebar() {
  const { user, isLoading } = useUser();

  return (
    <Sidebar collapsible="icon" className="dark text-white border-none">
      <SidebarHeader className="p-2 h-14 border-gray-700">
        <div className="flex flex-row items-center gap-2 group-data-[collapsible=icon]:justify-center justify-between">
          <Image
            src="icons/rehi.svg"
            alt="Logo"
            width={75}
            height={37}
            className="group-data-[collapsible=icon]:hidden transition-all duration-200"
          />
          <SidebarTrigger className="cursor-pointer" />
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarLink
                  url="/public/articles"
                  icon={Globe}
                  title="Public Articles"
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarLink {...homeItem} />
              </SidebarMenuItem>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Library className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Library
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {librarySubItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarLink {...sub} />
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarLink {...item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Dropdown (like your image) */}
      <SidebarFooter className="p-2 border-t border-gray-700">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-2 h-auto hover:bg-gray-800"
            >
              <div className="flex items-center justify-center h-8 gap-2 w-full">
                {isLoading ? (
                  <Spinner variant="bars" />
                ) : (
                  <>
                    <Image
                      src={user?.picture || ""}
                      alt={user?.name || "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="group-data-[collapsible=icon]:hidden truncate text-sm">
                      {user?.name}
                    </span>
                  </>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-64 bg-[#2d2d2d] text-white rounded-lg shadow-lg"
          >
            {ADMIN_EMAILS.includes(user?.email || "") && (
              <DropdownMenuItem
                asChild
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800"
              >
                <Link
                  className="flex flex-row items-center gap-5"
                  href="/dashboard"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="text-sm">Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              asChild
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800"
            >
              <Link
                className="flex flex-row items-center gap-5"
                href="/subscription"
              >
                <Star className="h-5 w-5" />
                <span className="text-sm">Upgrade your plan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800"
            >
              <Link
                href="/settings"
                className="flex flex-row items-center gap-5"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm">Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800"
            >
              <Link
                href="/profile"
                className="flex flex-row items-center gap-5"
              >
                <CircleUserRound className="h-5 w-5" />
                <span className="text-sm">Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/auth/logout";
              }}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800"
            >
              <div className="flex flex-row items-center gap-5">
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Log out</span>{" "}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
