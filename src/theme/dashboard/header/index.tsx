"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Bell } from "lucide-react";

interface DashboardHeaderProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

export function DashboardHeader({
  collapsed,
  toggleCollapse,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {/* Toggle Sidebar Button à esquerda do logo */}

        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo-white.svg"
            alt="DashCode"
            width={130}
            height={45}
            className="transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">{/* Ícones de notificação */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>

        {/* User profile button */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <span className="sr-only">User menu</span>
          <div className="h-8 w-8 rounded-full bg-muted"></div>
        </Button>
      </div>
    </header>
  );
}

// Export component as default for easier imports
export default DashboardHeader;
