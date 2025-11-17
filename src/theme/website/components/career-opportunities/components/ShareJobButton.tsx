"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaWhatsapp } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ShareJobButtonProps {
  url: string;
  title?: string;
  description?: string;
}

export function ShareJobButton({
  url,
  title,
  description,
}: ShareJobButtonProps) {
  const encodedUrl = encodeURIComponent(url);
  const [isOpen, setIsOpen] = useState(false);

  const shareTitle = title || "Vaga no Advance+";
  const shareText = description
    ? `${shareTitle} - ${description.slice(0, 100)}...`
    : shareTitle;
  const encodedText = encodeURIComponent(shareText);

  const links = [
    {
      label: "LinkedIn",
      icon: FaLinkedinIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Facebook",
      icon: FaFacebookF,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      icon: FaWhatsapp,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={isOpen}
          className="flex items-center gap-2 rounded-full border-none text-sm cursor-pointer"
        >
          Compartilhar
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen ? "rotate-180" : "rotate-0"
            )}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {links.map(({ label, icon: Icon, href }) => (
          <DropdownMenuItem
            key={label}
            onSelect={() => {
              window.open(href, "_blank", "noopener,noreferrer");
              setIsOpen(false);
            }}
            className="cursor-pointer"
          >
            <Icon className="h-4 w-4 text-gray-500" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
