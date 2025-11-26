import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface CertificadoTableSkeletonProps {
  rows: number;
}

export function CertificadoTableSkeleton({ rows }: CertificadoTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow
          key={index}
          className="border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </TableCell>

          <TableCell className="py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <Skeleton className="h-5 w-28 rounded" />
            </div>
          </TableCell>

          <TableCell className="py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <Skeleton className="h-4 w-24" />
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
