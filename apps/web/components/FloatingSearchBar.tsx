import React, { useState, useEffect } from "react";
import AISearchModal from "./AISearchModal";
import { useTranslation } from "next-i18next";

export default function FloatingSearchBar() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-base-100 border border-neutral-content shadow-lg hover:shadow-xl rounded-full px-5 py-3 transition-all hover:scale-105 active:scale-95"
        >
          <i className="bi-stars text-primary text-lg"></i>
          <span className="text-neutral text-sm">
            {t("ai_search") || "AI Search"}
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-base-200 rounded border border-neutral-content text-neutral">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      <AISearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
