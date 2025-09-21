// src/app/dashboard/404/page.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Página Não Encontrada
      </h2>
      <p className="text-gray-500 text-center max-w-md mb-8">
        O módulo ou recurso que você está tentando acessar não existe ou foi
        movido.
      </p>
      <Link href="/">
        <Button size="lg">Voltar ao Dashboard</Button>
      </Link>
    </div>
  );
}
