"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, KeyboardEvent } from "react";
import Image from "next/image";
import type { UserAvatarsProps, User, KeyboardEventProps } from "./types";
import {
  userAvatarsVariants,
  avatarVariants,
  bubbleVariants,
  tooltipVariants,
  avatarImageVariants,
} from "./variants";

export const UserAvatars = ({
  users,
  size = 56,
  className,
  maxVisible = 7,
  isRightToLeft = false,
  isOverlapOnly = false,
  overlap = 60,
  focusScale = 1.2,
  tooltipPlacement = "bottom",
  onAvatarClick,
  onHover,
  onHoverEnd,
}: UserAvatarsProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const slicedUsers = users.slice(
    0,
    Math.min(maxVisible + 1, users.length + 1)
  );
  const exceedMaxLength = users.length > maxVisible;

  const handleKeyEnter = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      setHoveredIndex(index);
      onAvatarClick?.(slicedUsers[index], index);
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    onHover?.(slicedUsers[index], index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    onHoverEnd?.();
  };

  const handleAvatarClick = (user: User, index: number) => {
    onAvatarClick?.(user, index);
  };

  return (
    <div className={cn(userAvatarsVariants(), className)}>
      {slicedUsers.map((user, index) => {
        const isHoveredOne = hoveredIndex === index;
        const isLengthBubble = exceedMaxLength && maxVisible === index;

        const diff = 1 - overlap / 100;
        const zIndex =
          isHoveredOne && isOverlapOnly
            ? slicedUsers.length
            : isRightToLeft
            ? slicedUsers.length - index
            : index;

        const shouldScale =
          isHoveredOne &&
          (!exceedMaxLength || slicedUsers.length - 1 !== index);

        const shouldShift =
          hoveredIndex !== null &&
          (isRightToLeft ? index < hoveredIndex : index > hoveredIndex) &&
          !isOverlapOnly;

        const baseGap = Number(size) * (overlap / 100);
        const neededGap = (Number(size) * (1 + focusScale)) / 2;
        const shift = Math.max(0, neededGap - baseGap);

        return (
          <motion.div
            key={user.id}
            role="img"
            aria-label={user.name || "User avatar"}
            className={cn(
              avatarVariants(),
              "outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full"
            )}
            style={{
              width: size,
              height: size,
              zIndex,
              marginLeft: index === 0 ? 0 : -Number(size) * diff,
            }}
            tabIndex={0}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onFocus={() => handleMouseEnter(index)}
            onBlur={handleMouseLeave}
            onKeyDown={(e) => handleKeyEnter(e, index)}
            onClick={() => handleAvatarClick(user, index)}
            animate={{
              scale: shouldScale ? focusScale : 1,
              x: shouldShift ? shift * (isRightToLeft ? -1 : 1) : 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Avatar bubble */}
            <div className="w-full h-full rounded-full overflow-hidden border border-white shadow-md">
              {isLengthBubble ? (
                <div className={cn(bubbleVariants())}>
                  +{users.length - maxVisible}
                </div>
              ) : (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={Number(size)}
                  height={Number(size)}
                  className={cn(avatarImageVariants())}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback para imagem quebrada
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500 text-xs font-medium">
                          ${user.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                      `;
                    }
                  }}
                />
              )}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
              {shouldScale && user.name && (
                <motion.div
                  role="tooltip"
                  initial={{
                    opacity: 0,
                    y: tooltipPlacement === "bottom" ? 8 : -8,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: tooltipPlacement === "bottom" ? 8 : -8,
                  }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    tooltipVariants({
                      placement: tooltipPlacement,
                    })
                  )}
                >
                  {user.name}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserAvatars;
