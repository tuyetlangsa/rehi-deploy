"use client";
import Link from "next/link";
import React from "react";
import { X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AppNavbar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLocation = (
    searchParams.get("location") || "reading"
  ).toLowerCase();

  const appliedQuery = searchParams.get("query") || "";

  const handleClearQuery = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("query");
    router.push(`/articles?${params.toString()}`);
  };
  const mainItems = [
    { title: "READING", url: "/articles?location=reading" },
    { title: "LATER", url: "/articles?location=later" },
    { title: "ARCHIVED", url: "/articles?location=archived" },
  ];

  return (
    <nav className="flex items-center justify-between py-3 md:py-5 px-4 md:px-10 flex-row">
      <div className="flex flex-row gap-3 md:gap-4 lg:gap-20 items-center flex-1 min-w-0">
        {/* Sidebar Trigger for Mobile */}
        <div className="md:hidden">
          <SidebarTrigger className="cursor-pointer" />
        </div>
        <div className="flex items-center gap-2 md:gap-5 flex-wrap">
          {mainItems.map((item) => {
            const isActive = item.title.toLowerCase() === currentLocation;
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`text-xs md:text-sm font-medium text-white px-2 md:px-3 py-1 ${
                  isActive
                    ? "underline underline-offset-24 decoration-2"
                    : "hover:text-gray-300 hover:underline underline-offset-8"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
        {appliedQuery && (
          <div className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-gray-800 rounded-md text-xs md:text-sm text-gray-300 flex-shrink-0">
            <span className="text-xs font-medium hidden sm:inline">
              Filter:{" "}
            </span>
            <code className="px-1 py-0.5 bg-gray-700 rounded text-gray-200 text-xs truncate max-w-[120px] md:max-w-none">
              {appliedQuery}
            </code>
            <button
              onClick={handleClearQuery}
              className="hover:bg-gray-700 rounded p-1 transition-colors flex-shrink-0"
              title="Clear filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
