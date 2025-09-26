import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface VagaTableSkeletonProps {
  rows: number;
}

export function VagaTableSkeleton({ rows }: VagaTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow
          key={index}
          className="border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
            </div>
          </TableCell>

          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>

          <TableCell className="py-4">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </TableCell>

          <TableCell className="py-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>

          <TableCell className="py-4">
            <Skeleton className="h-4 w-20" />
          </TableCell>

          <TableCell className="py-4">
            <Skeleton className="h-4 w-24" />
          </TableCell>

          <TableCell className="py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </TableCell>

          <TableCell className="py-4">
            <Skeleton className="h-8 w-8 rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
