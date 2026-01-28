import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import ClickAwayHandler from "@/components/ClickAwayHandler";
import { useTranslation } from "next-i18next";
import {
  LinkIncludingShortenedCollectionAndTags,
  CollectionIncludingMembersAndLinkCount,
  TagIncludingLinkCount,
} from "@linkwarden/types";
import { Drawer } from "vaul";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useAddSearchHistory } from "@linkwarden/router/searchHistory";
import SearchTabs, { SearchTab } from "@/components/AISearch/SearchTabs";
import RecentSearches from "@/components/AISearch/RecentSearches";
import RecentlyAdded from "@/components/AISearch/RecentlyAdded";
import SearchResultsList from "@/components/AISearch/SearchResultsList";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResults {
  links: LinkIncludingShortenedCollectionAndTags[];
  pins: LinkIncludingShortenedCollectionAndTags[];
  collections: CollectionIncludingMembersAndLinkCount[];
  tags: TagIncludingLinkCount[];
}

interface SearchCounts {
  links: number;
  pins: number;
  collections: number;
  tags: number;
}

export default function AISearchModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    links: [],
    pins: [],
    collections: [],
    tags: [],
  });
  const [counts, setCounts] = useState<SearchCounts>({
    links: 0,
    pins: 0,
    collections: 0,
    tags: 0,
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SearchTab>("links");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const addSearchHistory = useAddSearchHistory();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const performSearch = useCallback(
    async (searchQuery: string, saveToHistory: boolean = false) => {
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response = await fetch("/api/v1/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery.trim() }),
        });

        const data = await response.json();

        if (data.success) {
          setResults({
            links: data.data?.links || [],
            pins: data.data?.pins || [],
            collections: data.data?.collections || [],
            tags: data.data?.tags || [],
          });
          setCounts(
            data.counts || {
              links: data.data?.links?.length || 0,
              pins: data.data?.pins?.length || 0,
              collections: data.data?.collections?.length || 0,
              tags: data.data?.tags?.length || 0,
            }
          );

          // Save to history only on explicit search (Enter/button)
          if (saveToHistory) {
            addSearchHistory.mutate(searchQuery.trim());
          }
        } else {
          setError(data.message || "Search failed");
          setResults({ links: [], pins: [], collections: [], tags: [] });
          setCounts({ links: 0, pins: 0, collections: 0, tags: 0 });
        }
      } catch (err) {
        setError("Failed to perform search");
        setResults({ links: [], pins: [], collections: [], tags: [] });
        setCounts({ links: 0, pins: 0, collections: 0, tags: 0 });
      } finally {
        setIsLoading(false);
      }
    },
    [addSearchHistory]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search - don't save to history on typing
    if (newQuery.trim()) {
      debounceRef.current = setTimeout(() => {
        performSearch(newQuery, false);
      }, 300);
    } else {
      setHasSearched(false);
      setResults({ links: [], pins: [], collections: [], tags: [] });
      setCounts({ links: 0, pins: 0, collections: 0, tags: 0 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && query.trim()) {
      // Clear debounce and search immediately, save to history
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      performSearch(query, true);
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSearchClick = () => {
    if (!isLoading && query.trim()) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      performSearch(query, true);
    }
  };

  const handleRecentSearchSelect = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch(searchQuery, false);
  };

  const handleClose = () => {
    setQuery("");
    setResults({ links: [], pins: [], collections: [], tags: [] });
    setCounts({ links: 0, pins: 0, collections: 0, tags: 0 });
    setHasSearched(false);
    setError(null);
    setActiveTab("links");
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onClose();
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const showInitialState = !hasSearched && !query.trim();

  const content = (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center flex-1 relative">
          <label
            htmlFor="ai-search-input"
            className="inline-flex items-center w-fit absolute left-3 pointer-events-none text-neutral"
          >
            <i className="bi-stars text-lg"></i>
          </label>
          <input
            ref={inputRef}
            id="ai-search-input"
            type="text"
            placeholder={
              t("ask_ai_to_find_bookmarks") || "Ask AI to find bookmarks..."
            }
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="border border-neutral-content bg-base-200 focus:border-base-content py-3 pl-10 pr-4 w-full outline-none text-base font-mono"
            autoComplete="off"
          />
        </div>
        <button
          onClick={handleSearchClick}
          disabled={isLoading || !query.trim()}
          className="btn btn-primary px-6 font-mono"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            t("search") || "Search"
          )}
        </button>
      </div>

      {/* Tabs - only show when searching */}
      {!showInitialState && (
        <SearchTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto mt-4">
        {error && <div className="text-error text-center py-4 font-mono">{error}</div>}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-lg text-neutral"></span>
            <span className="ml-3 text-neutral font-mono">
              {t("searching_with_ai") || "Searching with AI..."}
            </span>
          </div>
        )}

        {/* Initial State - Recent Searches & Recently Added */}
        {showInitialState && !isLoading && (
          <div className="space-y-6">
            <RecentSearches onSearchSelect={handleRecentSearchSelect} />
            <RecentlyAdded />

            {/* Hint text */}
            <div className="text-center py-4 text-neutral font-mono">
              <i className="bi-stars text-4xl mb-4 block text-neutral opacity-50"></i>
              <p>{t("ai_search_hint") || "Try natural language queries like:"}</p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-base-content">
                  &ldquo;Show me all design tools&rdquo;
                </p>
                <p className="text-base-content">
                  &ldquo;Find articles about React&rdquo;
                </p>
                <p className="text-base-content">&ldquo;Development resources&rdquo;</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!showInitialState && !isLoading && !error && (
          <>
            {activeTab === "links" && (
              <SearchResultsList
                links={results.links}
                type="links"
                onClose={handleClose}
              />
            )}
            {activeTab === "pins" && (
              <SearchResultsList
                links={results.pins}
                type="pins"
                onClose={handleClose}
              />
            )}
            {activeTab === "collections" && (
              <SearchResultsList
                collections={results.collections}
                type="collections"
                onClose={handleClose}
              />
            )}
            {activeTab === "tags" && (
              <SearchResultsList
                tags={results.tags}
                type="tags"
                onClose={handleClose}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  if (width < 640) {
    return (
      <Drawer.Root open={isOpen} onClose={handleClose}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="flex flex-col h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-50">
            <div className="p-4 bg-base-100 flex-1 border-neutral-content border-t overflow-hidden flex flex-col">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 bg-neutral mb-4" />
              {content}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex justify-center items-start pt-20 z-50 fade-in">
      <ClickAwayHandler
        onClickOutside={handleClose}
        className="w-full max-w-2xl mx-4"
      >
        <div className="bg-base-100 border border-neutral-content p-5 max-h-[70vh] overflow-hidden flex flex-col slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 font-mono">
              <i className="bi-stars text-neutral"></i>
              {t("ai_search") || "AI Search"}
            </h2>
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm btn-square"
            >
              <i className="bi-x text-xl"></i>
            </button>
          </div>
          {content}
        </div>
      </ClickAwayHandler>
    </div>,
    document.body
  );
}
