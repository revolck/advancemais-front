import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function CurriculoTableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow
          key={i}
          className="border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <TableCell className="py-4">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </TableCell>
          <TableCell className="py-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-52" />
            </div>
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </TableCell>
          <TableCell className="text-right w-[168px]">
            <div className="flex items-center justify-end gap-2">
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
