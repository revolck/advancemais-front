import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function TurmaTableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20 mt-1" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

