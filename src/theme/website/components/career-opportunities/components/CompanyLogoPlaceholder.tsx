"use client";

import React from "react";

export function CompanyLogoPlaceholder() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <rect width="56" height="56" rx="16" fill="#E6ECFF" />
      <path
        d="M18 38V20c0-1.105.895-2 2-2h16c1.105 0 2 .895 2 2v18"
        stroke="#0a1f88"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 26h8M24 30h8M24 34h8"
        stroke="#0a1f88"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="28" cy="12" r="4" fill="#0a1f88" />
    </svg>
  );
}
