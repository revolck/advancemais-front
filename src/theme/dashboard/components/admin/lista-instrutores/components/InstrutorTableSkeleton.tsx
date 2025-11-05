import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function InstrutorTableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow
          key={i}
          className="border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <TableCell className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-28" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
