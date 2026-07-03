"use client";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/mobile-header";

/**
 * Client-side clone of the (main) route group's layout, used by the offline
 * shell so offline pages keep the app sidebar + mobile header. The real layout
 * reads the sidebar cookie on the server; offline we just default it open.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider name="main-sidebar" defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <MobileHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
