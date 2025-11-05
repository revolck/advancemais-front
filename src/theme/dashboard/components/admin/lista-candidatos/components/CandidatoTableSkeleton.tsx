"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function CandidatoTableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow key={index} className="border-gray-100">
          <TableCell className="py-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1 w-[160px]">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </TableCell>

          <TableCell className="py-4 w-[240px]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-36" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </TableCell>

          <TableCell className="py-4 w-[220px]">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          </TableCell>

          <TableCell className="py-4">
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex flex-col gap-1 items-start">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
          </TableCell>

          <TableCell className="py-4">
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </TableCell>

          <TableCell className="py-4">
            <div className="flex justify-end">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}


