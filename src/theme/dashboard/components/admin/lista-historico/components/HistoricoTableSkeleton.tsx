import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function HistoricoTableSkeleton({ rows }: { rows: number }) {
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
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-24 rounded-full" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

