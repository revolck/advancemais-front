"use client";

import { useEffect, useState, useCallback } from "react";
import { UserRole } from "@/config/roles";

function getRoleFromCookie(): UserRole | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user_role="))
    ?.split("=")[1];

  if (!cookie) return null;

  // Migração de papéis: manter compatibilidade com cookies antigos
  if (cookie === "RECRUTADOR") {
    return UserRole.SETOR_DE_VAGAS;
  }
  if (cookie === "PSICOLOGO") {
    return UserRole.RECRUTADOR;
  }

  // Verifica se o valor do cookie é um UserRole válido
  const validRoles = Object.values(UserRole);
  if (validRoles.includes(cookie as UserRole)) {
    return cookie as UserRole;
  }

  return null;
}

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(() => {
    // Inicializa com o valor do cookie imediatamente (SSR-safe)
    if (typeof document !== "undefined") {
      return getRoleFromCookie();
    }
    return null;
  });

  const updateRole = useCallback(() => {
    const newRole = getRoleFromCookie();
    // Só atualiza e loga se o role realmente mudou
    if (newRole !== role) {
      if (process.env.NODE_ENV === "development") {
        console.log("[useUserRole] Role atualizado:", role, "->", newRole);
      }
      setRole(newRole);
      // Força re-render se necessário
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("role-updated"));
      }
    }
  }, [role]);

  useEffect(() => {
    // Atualiza o role inicialmente
    updateRole();

    // Verifica mudanças no cookie periodicamente (útil para mudanças manuais)
    const interval = setInterval(() => {
      updateRole();
    }, 1000); // Verifica a cada 1 segundo

    // Também escuta eventos de storage (caso o cookie seja alterado via JavaScript)
    const handleStorageChange = () => {
      updateRole();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [updateRole]);

  return role;
}
