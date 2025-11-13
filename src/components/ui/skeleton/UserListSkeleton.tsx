import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserListSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

/**
 * Componente de skeleton loading para listagem de usuários
 * 
 * @param rows - Número de linhas a exibir (padrão: 10)
 * @param showAvatar - Se deve exibir skeleton para avatar (padrão: true)
 * @param showActions - Se deve exibir skeleton para ações (padrão: true)
 */
export function UserListSkeleton({
  rows = 10,
  showAvatar = true,
  showActions = true,
}: UserListSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" /> {/* Search input */}
        <Skeleton className="h-10 w-32" /> {/* Filter button */}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            {showAvatar && <TableHead className="w-12" />}
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="w-24">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {showAvatar && (
                <TableCell>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </TableCell>
              )}
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              {showActions && (
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

