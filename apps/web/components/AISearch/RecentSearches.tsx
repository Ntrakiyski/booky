import React from "react";
import {
  useSearchHistory,
  useClearSearchHistory,
  SearchHistoryEntry,
} from "@linkwarden/router/searchHistory";
import { useTranslation } from "next-i18next";

interface RecentSearchesProps {
  onSearchSelect: (query: string) => void;
}

export default function RecentSearches({ onSearchSelect }: RecentSearchesProps) {
  const { t } = useTranslation();
  const { data: history, isLoading } = useSearchHistory();
  const clearHistory = useClearSearchHistory();

  if (isLoading) {
    return (
      <div className="py-2">
        <div className="h-4 w-24 bg-base-300 animate-pulse mb-2"></div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-20 bg-base-300 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-neutral font-mono">
          {t("recent_searches") || "Recent Searches"}
        </h3>
        <button
          onClick={() => clearHistory.mutate()}
          className="text-xs text-neutral hover:text-base-content transition-colors font-mono"
          disabled={clearHistory.isPending}
        >
          {t("clear") || "Clear"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((entry: SearchHistoryEntry) => (
          <button
            key={entry.id}
            onClick={() => onSearchSelect(entry.query)}
            className="px-3 py-1.5 text-sm bg-base-200 hover:bg-base-300 border border-neutral-content transition-colors truncate max-w-[200px] font-mono"
          >
            {entry.query}
          </button>
        ))}
      </div>
    </div>
  );
}
