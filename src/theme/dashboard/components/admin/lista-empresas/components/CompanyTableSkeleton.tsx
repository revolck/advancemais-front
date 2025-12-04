import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

interface CompanyTableSkeletonProps {
  rows?: number;
}

export const CompanyTableSkeleton: React.FC<CompanyTableSkeletonProps> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index} className="border-gray-100">
          {/* Empresa */}
          <TableCell className="py-4 min-w-[280px] max-w-[320px]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" aria-hidden="true" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse flex-shrink-0" />
                </div>
                <div className="h-2.5 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </TableCell>
          {/* Plano */}
          <TableCell className="min-w-[140px] max-w-[180px]">
            <div className="space-y-1.5">
              <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-2.5 w-14 bg-gray-200 rounded animate-pulse" />
            </div>
          </TableCell>
          {/* Localização */}
          <TableCell className="min-w-[120px] max-w-[150px]">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-gray-200 rounded animate-pulse flex-shrink-0" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </TableCell>
          {/* Status */}
          <TableCell className="min-w-[120px] max-w-[160px]">
            <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
          </TableCell>
          {/* Data da criação */}
          <TableCell className="min-w-[100px] max-w-[120px]">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse flex-shrink-0" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </TableCell>
          {/* Dias restantes */}
          <TableCell className="min-w-[100px] max-w-[140px]">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse flex-shrink-0" />
              <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
            </div>
          </TableCell>
          {/* Ação */}
          <TableCell className="text-right w-16">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
