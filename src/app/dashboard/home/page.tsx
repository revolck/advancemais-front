// src/app/dashboard/home/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHomePage() {
  const [tenant, setTenant] = useState<string>("Carregando...");
  const [role, setRole] = useState<string>("Carregando...");
  const router = useRouter();

  useEffect(() => {
    // Em um ambiente real, isso viria do contexto de autenticação
    // Por enquanto, pegamos dos cookies
    const tenantName =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("tenant_name="))
        ?.split("=")[1] || "Empresa Demonstração";

    const userRole =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("dev_role="))
        ?.split("=")[1] || "admin";

    setTenant(decodeURIComponent(tenantName));
    setRole(userRole);
  }, []);

  // Mapeamento de títulos baseados em papéis
  const roleLabels = {
    admin: "Administrador",
    manager: "Gerente",
    viewer: "Visualizador",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant}</div>
            <p className="text-xs text-muted-foreground">
              Multi-tenant SaaS Platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Seu Papel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roleLabels[role as keyof typeof roleLabels] || role}
            </div>
            <p className="text-xs text-muted-foreground">
              Controle de acesso baseado em papéis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">
          Testar Papéis (Desenvolvimento)
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              document.cookie = "dev_role=admin; path=/";
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue text-white rounded"
          >
            Admin
          </button>
          <button
            onClick={() => {
              document.cookie = "dev_role=manager; path=/";
              window.location.reload();
            }}
            className="px-4 py-2 bg-purple text-white rounded"
          >
            Manager
          </button>
          <button
            onClick={() => {
              document.cookie = "dev_role=viewer; path=/";
              window.location.reload();
            }}
            className="px-4 py-2 bg-teal text-white rounded"
          >
            Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
