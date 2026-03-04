import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface EstagioTableSkeletonProps {
  rows: number;
}

export function EstagioTableSkeleton({ rows }: EstagioTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow
          key={index}
          className="border-gray-100 bg-white transition-colors hover:bg-blue-50/40"
        >
          <TableCell className="py-4 px-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-64" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </TableCell>

          <TableCell className="py-4 px-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-60" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </div>
          </TableCell>

          <TableCell className="py-4 px-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </TableCell>

          <TableCell className="py-4 px-3">
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>

          <TableCell className="py-4 px-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </TableCell>

          <TableCell className="py-4 px-3 text-right">
            <Skeleton className="h-8 w-8 rounded-full ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
