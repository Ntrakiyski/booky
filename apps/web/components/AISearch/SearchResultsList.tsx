import React from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import {
  LinkIncludingShortenedCollectionAndTags,
  CollectionIncludingMembersAndLinkCount,
  TagIncludingLinkCount,
} from "@linkwarden/types";
import unescapeString from "@/lib/client/unescapeString";
import LinkIcon from "@/components/LinkViews/LinkComponents/LinkIcon";

interface SearchResultsListProps {
  links?: LinkIncludingShortenedCollectionAndTags[];
  collections?: CollectionIncludingMembersAndLinkCount[];
  tags?: TagIncludingLinkCount[];
  type: "links" | "pins" | "collections" | "tags";
  onClose: () => void;
}

export default function SearchResultsList({
  links = [],
  collections = [],
  tags = [],
  type,
  onClose,
}: SearchResultsListProps) {
  const { t } = useTranslation();

  if (type === "links" || type === "pins") {
    if (links.length === 0) {
      return (
        <div className="text-center py-8 text-neutral font-mono">
          {t("no_results_found") || "No results found"}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.id}
            href={`/links/${link.id}`}
            onClick={onClose}
            className="flex items-center gap-3 p-2 hover:bg-base-300 transition-colors group"
          >
            <div className="shrink-0">
              <LinkIcon link={link} hideBackground />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base-content font-medium truncate font-mono">
                {unescapeString(link.name)}
              </p>
              <div className="flex items-center gap-2 text-xs text-neutral font-mono">
                {link.collection && (
                  <span className="truncate">{link.collection.name}</span>
                )}
                {link.tags && link.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="truncate">
                      {link.tags
                        .slice(0, 2)
                        .map((tag) => tag.name)
                        .join(", ")}
                    </span>
                  </>
                )}
              </div>
            </div>
            {type === "pins" && (
              <i className="bi-pin-fill text-base-content text-sm"></i>
            )}
          </Link>
        ))}
      </div>
    );
  }

  if (type === "collections") {
    if (collections.length === 0) {
      return (
        <div className="text-center py-8 text-neutral font-mono">
          {t("no_results_found") || "No results found"}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            onClick={onClose}
            className="flex items-center gap-3 p-2 hover:bg-base-300 transition-colors"
          >
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{ backgroundColor: collection.color + "20" }}
            >
              <i
                className={`bi-${collection.icon || "folder"} text-lg`}
                style={{ color: collection.color }}
              ></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base-content font-medium truncate font-mono">
                {collection.name}
              </p>
              <p className="text-xs text-neutral font-mono">
                {collection._count?.links || 0} links
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (type === "tags") {
    if (tags.length === 0) {
      return (
        <div className="text-center py-8 text-neutral font-mono">
          {t("no_results_found") || "No results found"}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.id}`}
            onClick={onClose}
            className="flex items-center gap-3 p-2 hover:bg-base-300 transition-colors"
          >
            <div className="w-8 h-8 bg-base-300 flex items-center justify-center">
              <i className="bi-hash text-lg text-neutral"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base-content font-medium truncate font-mono">{tag.name}</p>
              <p className="text-xs text-neutral font-mono">
                {tag._count?.links || 0} links
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return null;
}
