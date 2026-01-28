import React from "react";
import { useLinks } from "@linkwarden/router/links";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { LinkIncludingShortenedCollectionAndTags } from "@linkwarden/types";

function extractDomain(url: string | null | undefined): string {
  if (!url) return "Link";
  try {
    const hostname = new URL(url).hostname;
    // Remove 'www.' prefix if present
    const domain = hostname.replace(/^www\./, "");
    // Get the part before the TLD
    const parts = domain.split(".");
    if (parts.length >= 2) {
      return parts[0];
    }
    return domain;
  } catch {
    return "Link";
  }
}

export default function RecentlyAdded() {
  const { t } = useTranslation();
  const { links, data } = useLinks({ sort: 0 }); // Sort 0 = DateNewestFirst

  const recentLinks = links.slice(0, 3);

  if (data.isLoading) {
    return (
      <div className="py-2">
        <div className="h-4 w-24 bg-base-300 animate-pulse mb-2"></div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-20 h-20 bg-base-300 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (recentLinks.length === 0) {
    return null;
  }

  return (
    <div className="py-2">
      <h3 className="text-sm font-medium text-neutral mb-2 font-mono">
        {t("recently_added") || "Recently Added"}
      </h3>
      <div className="flex gap-3">
        {recentLinks.map((link: LinkIncludingShortenedCollectionAndTags) => (
          <Link
            key={link.id}
            href={`/links/${link.id}`}
            className="w-20 h-20 flex flex-col items-center justify-center gap-1.5 bg-base-200 hover:bg-base-300 border border-neutral-content transition-colors group"
          >
            <div className="w-8 h-8 bg-base-300 flex items-center justify-center overflow-hidden">
              {link.icon ? (
                <img
                  src={`/api/v1/archives/${link.id}?format=icon`}
                  alt=""
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <i
                className={`bi-link-45deg text-lg text-neutral ${link.icon ? "hidden" : ""}`}
              ></i>
            </div>
            <span className="text-xs text-neutral group-hover:text-base-content truncate max-w-[72px] text-center font-mono">
              {extractDomain(link.url)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
