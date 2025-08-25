"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SliderLayoutProps {
  children: React.ReactNode;
}

export default function SliderLayout({ children }: SliderLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/dashboard/config/website/pagina-inicial/slider/desktop",
      label: "Desktop",
      description: "Sliders para telas grandes",
      active: pathname?.includes("/desktop") ?? false,
    },
    {
      href: "/dashboard/config/website/pagina-inicial/slider/mobile",
      label: "Mobile/Tablet",
      description: "Sliders para dispositivos móveis",
      active: pathname?.includes("/mobile") ?? false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col py-4 px-2 border-b-2 transition-colors",
                  tab.active
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                <span className="text-xs mt-1">{tab.description}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="min-h-[calc(100vh-200px)]">{children}</div>
    </div>
  );
}
