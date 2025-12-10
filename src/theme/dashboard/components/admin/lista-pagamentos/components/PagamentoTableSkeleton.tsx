"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PagamentoTableSkeleton() {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50/50">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Data
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Status
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Método
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Valor
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
            Plano
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, index) => (
          <tr key={index} className="border-b border-gray-100">
            <td className="px-4 py-3">
              <Skeleton className="h-4 w-32" />
            </td>
            <td className="px-4 py-3">
              <Skeleton className="h-6 w-24 rounded-full" />
            </td>
            <td className="px-4 py-3">
              <Skeleton className="h-4 w-20" />
            </td>
            <td className="px-4 py-3">
              <Skeleton className="h-4 w-20" />
            </td>
            <td className="px-4 py-3">
              <Skeleton className="h-4 w-24" />
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end">
                <Skeleton className="h-8 w-32 rounded-md" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

