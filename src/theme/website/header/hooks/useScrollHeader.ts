"use client";

import { useEffect, useState } from "react";

/**
 * Hook seguro para RSC/SSR que detecta se a página foi rolada.
 * Evita dependências de hooks do framer-motion no server boundary.
 */
export const useScrollHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = typeof window !== "undefined" ? window.scrollY : 0;
      setIsScrolled(y > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isScrolled };
};
