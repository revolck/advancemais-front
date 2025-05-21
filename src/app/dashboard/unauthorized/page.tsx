"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function UnauthorizedPage() {
  const [role, setRole] = useState("carregando...");

  useEffect(() => {
    const userRole =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("dev_role="))
        ?.split("=")[1] || "não definido";

    setRole(userRole);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Acesso Não Autorizado
        </h1>
        <p className="text-gray-600 mb-6">
          Seu papel atual ({role}) não tem permissão para acessar este módulo.
        </p>

        <div className="flex flex-col space-y-3">
          {/* Use o caminho limpo aqui */}
          <Link href="/analytics">
            <Button className="w-full">Voltar para Analytics</Button>
          </Link>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">
              Alternar papel (modo desenvolvimento):
            </p>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.cookie = "dev_role=admin; path=/";
                  window.location.reload();
                }}
              >
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.cookie = "dev_role=manager; path=/";
                  window.location.reload();
                }}
              >
                Manager
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.cookie = "dev_role=viewer; path=/";
                  window.location.reload();
                }}
              >
                Viewer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
