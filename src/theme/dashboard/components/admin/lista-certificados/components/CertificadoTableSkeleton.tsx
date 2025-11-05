import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function CertificadoTableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
          <TableCell className="py-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24 mt-1" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-4 w-32" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

