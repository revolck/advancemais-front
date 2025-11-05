"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface UsuarioTableSkeletonProps {
  rows?: number;
}

export function UsuarioTableSkeleton({ rows = 5 }: UsuarioTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <TableRow key={i} className="border-gray-100">
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell className="py-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
