import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function FrequenciaTableSkeleton({ rows }: { rows: number }) {
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
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
          <TableCell className="py-4 px-3">
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
          <TableCell className="py-4 px-3">
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell className="py-4 px-3">
            <Skeleton className="h-10 w-full rounded-md" />
          </TableCell>
          <TableCell className="py-4 px-3 text-right">
            <Skeleton className="h-9 w-24 rounded-md ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

