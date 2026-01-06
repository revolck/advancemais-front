import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function FrequenciaResumoTableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow
          key={i}
          className="border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <TableCell className="py-4 px-3">
            <Skeleton className="h-4 w-56" />
          </TableCell>
          <TableCell className="py-4 px-3">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="py-4 px-3">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="py-4 px-3">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="py-4 px-3">
            <div className="flex items-center justify-end gap-3">
              <Skeleton className="h-2 w-36 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
