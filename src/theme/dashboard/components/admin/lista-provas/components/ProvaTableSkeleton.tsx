import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface ProvaTableSkeletonProps {
  rows: number;
}

export function ProvaTableSkeleton({ rows }: ProvaTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow
          key={index}
          className="border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-20 rounded flex-shrink-0" />
            </div>
          </TableCell>

          <TableCell className="py-4">
            <Skeleton className="h-4 w-24" />
          </TableCell>

          <TableCell className="py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>

          <TableCell className="py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>

          <TableCell className="py-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>

          <TableCell className="py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
