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
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" aria-hidden="true" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 w-1/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
