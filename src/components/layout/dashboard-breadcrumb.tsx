"use client";

import { Icon } from "@/components/ui/custom/Icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import type { BreadcrumbItem as BreadcrumbItemType } from "@/config/breadcrumb";

interface DashboardBreadcrumbProps {
  items: BreadcrumbItemType[];
  isLastItemLoading?: boolean;
}

export function DashboardBreadcrumb({
  items,
  isLastItemLoading = false,
}: DashboardBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <div key={`breadcrumb-${index}`} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {item.icon && <Icon name={item.icon} className="size-4" />}
                    {isLastItemLoading ? (
                      <Skeleton className="h-4 w-44 rounded-md" />
                    ) : (
                      <span className="max-w-[220px] truncate font-semibold text-gray-800">
                        {item.label}
                      </span>
                    )}
                  </BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink
                    href={item.href}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    {item.icon && <Icon name={item.icon} className="size-4" />}
                    <span>{item.label}</span>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-2 text-gray-500">
                    {item.icon && <Icon name={item.icon} className="size-4" />}
                    <span>{item.label}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator>
                  <Icon
                    name="ChevronRight"
                    className="size-4 text-gray-800/50"
                  />
                </BreadcrumbSeparator>
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
