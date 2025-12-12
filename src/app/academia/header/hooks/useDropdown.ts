"use client";

import { useState } from "react";

export const useDropdown = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownEnter = (key: string) => {
    setOpenDropdown(key);
  };

  const handleDropdownLeave = () => {
    setOpenDropdown(null);
  };

  return {
    openDropdown,
    handleDropdownEnter,
    handleDropdownLeave,
  };
};

