import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function AlunoTableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow
          key={i}
          className="border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </TableCell>
          <TableCell className="py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <Skeleton className="h-4 w-40" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0 mt-0.5" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <Skeleton className="h-4 w-40" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
          <TableCell className="text-right w-16">
            <Skeleton className="h-8 w-8 rounded-full mx-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
