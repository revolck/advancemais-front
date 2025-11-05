"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@/config/roles";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_role="))
      ?.split("=")[1];

    if (!cookie) return;

    // Migração de papéis: manter compatibilidade com cookies antigos
    if (cookie === "RECRUTADOR") {
      setRole(UserRole.SETOR_DE_VAGAS);
      return;
    }
    if (cookie === "PSICOLOGO") {
      setRole(UserRole.RECRUTADOR);
      return;
    }
    // Valor já esperado
    setRole(cookie as UserRole);
  }, []);

  return role;
}
