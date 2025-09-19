"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

export interface AvatarCirclesProps {
  avatarUrls?: string[];
  numPeople?: number;
  maxVisible?: number;
  size?: number; // px
  className?: string;
}

export function AvatarCircles({
  avatarUrls = [],
  numPeople,
  maxVisible = 5,
  size = 28,
  className,
}: AvatarCirclesProps) {
  const visible = avatarUrls.slice(0, maxVisible);
  const extra = Math.max(
    0,
    (typeof numPeople === "number" ? numPeople : avatarUrls.length) -
      visible.length
  );

  const sizeClass = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
  } as React.CSSProperties;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((url, idx) => (
        <div
          key={`${url}-${idx}`}
          className={cn(
            "rounded-full ring-2 ring-white",
            idx > 0 ? "-ml-2" : undefined
          )}
          style={sizeClass}
        >
          <Avatar className="h-full w-full">
            <AvatarImage src={url} alt="avatar" />
            <AvatarFallback className="text-[10px]">—</AvatarFallback>
          </Avatar>
        </div>
      ))}
      {extra > 0 && (
        <div
          className={cn("rounded-full -ml-2 ring-2 ring-white bg-black text-white grid place-items-center font-semibold",)}
          style={sizeClass}
        >
          <span className="text-[10px]">+{extra}</span>
        </div>
      )}
    </div>
  );
}

export default AvatarCircles;

