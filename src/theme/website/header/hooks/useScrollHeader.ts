"use client";

import { useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export const useScrollHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  return { isScrolled };
};
