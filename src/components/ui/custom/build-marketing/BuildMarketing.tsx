"use client";

import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";

interface BuildMarketingSection {
  id: string;
  label: string;
  icon: IconName;
}

interface BuildMarketingProps {
  sections: BuildMarketingSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  sidebarTitle?: string;
  sidebarSubtitle?: string;
  sidebarContent: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export function BuildMarketing({
  sections,
  activeSection,
  onSectionChange,
  sidebarTitle,
  sidebarSubtitle,
  sidebarContent,
  toolbar,
  children,
  contentClassName,
}: BuildMarketingProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <div className="grid min-h-[calc(100dvh-16rem)] grid-cols-1 lg:grid-cols-[76px_340px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-row overflow-x-auto px-3 py-4 lg:flex-col lg:overflow-visible lg:px-2">
            {sections.map((section) => {
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={section.label}
                  className={cn(
                    "relative flex min-w-[72px] cursor-pointer flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition-colors lg:min-w-0",
                    isActive
                      ? "bg-[var(--primary-color)] text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-r-full transition lg:block",
                      isActive ? "bg-[var(--primary-color)]" : "bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border transition",
                      isActive
                        ? "border-[var(--secondary-color)] bg-[var(--secondary-color)] text-white"
                        : "border-slate-200 bg-white text-slate-400",
                    )}
                  >
                    <Icon name={section.icon} size={18} />
                  </span>
                  <span className="!text-[11px] font-medium leading-tight">
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-full min-h-0 flex-col">
            {(sidebarTitle || sidebarSubtitle) && (
              <div className="border-b border-slate-200 px-5 py-3.5">
                {sidebarTitle ? (
                  <h3 className="!text-sm mb-0! font-semibold text-slate-950">
                    {sidebarTitle}
                  </h3>
                ) : null}
                {sidebarSubtitle ? (
                  <p className="mt-0! mb-0! !text-xs leading-5 text-slate-500">
                    {sidebarSubtitle}
                  </p>
                ) : null}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {sidebarContent}
            </div>
          </div>
        </aside>

        <div className="min-w-0 bg-slate-100/60">
          {toolbar ? (
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              {toolbar}
            </div>
          ) : null}
          <div
            className={cn(
              "h-full min-h-0 overflow-auto p-5",
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
