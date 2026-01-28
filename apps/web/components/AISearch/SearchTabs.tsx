import React from "react";
import { cn } from "@/lib/utils";

export type SearchTab = "links" | "pins" | "collections" | "tags";

interface SearchTabsProps {
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
  counts: {
    links: number;
    pins: number;
    collections: number;
    tags: number;
  };
}

export default function SearchTabs({
  activeTab,
  onTabChange,
  counts,
}: SearchTabsProps) {
  const tabs: { id: SearchTab; label: string; count: number }[] = [
    { id: "links", label: "Links", count: counts.links },
    { id: "pins", label: "Pins", count: counts.pins },
    { id: "collections", label: "Collections", count: counts.collections },
    { id: "tags", label: "Tags", count: counts.tags },
  ];

  return (
    <div className="flex border-b border-neutral-content">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors relative font-mono",
            activeTab === tab.id
              ? "text-base-content border-b-2 border-base-content -mb-[1px]"
              : "text-neutral hover:text-base-content"
          )}
        >
          {tab.label}
          {tab.count > 0 && (
            <span
              className={cn(
                "ml-1.5 px-1.5 py-0.5 text-xs",
                activeTab === tab.id
                  ? "bg-base-content text-base-100"
                  : "bg-base-300 text-neutral"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
