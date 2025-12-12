import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function AulaTableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
          <TableCell className="py-4 px-4">
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell className="py-4 px-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </TableCell>
          {/* Instrutor */}
          <TableCell className="py-4 px-4">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="py-4 px-4">
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
          <TableCell className="py-4 px-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
          <TableCell className="py-4 px-4">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="py-4 px-4">
            <Skeleton className="h-4 w-16 mx-auto" />
          </TableCell>
          <TableCell className="py-4 px-4">
            <Skeleton className="h-5 w-5 rounded-full mx-auto" />
          </TableCell>
          <TableCell className="py-4 px-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </TableCell>
          <TableCell className="py-4 px-4 text-right">
            <Skeleton className="h-8 w-8 rounded-full ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
