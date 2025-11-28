"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

interface SolicitacaoTableSkeletonProps {
  rows?: number;
}

export function SolicitacaoTableSkeleton({ rows = 5 }: SolicitacaoTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index} className="border-gray-100">
          {/* Vaga */}
          <TableCell className="py-4 min-w-[280px] max-w-[320px]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </TableCell>

          {/* Empresa */}
          <TableCell className="min-w-[200px] max-w-[250px]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </TableCell>

          {/* Status */}
          <TableCell className="min-w-[120px] max-w-[160px]">
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>

          {/* Data */}
          <TableCell className="min-w-[100px] max-w-[120px]">
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
          </TableCell>

          {/* Ações */}
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
