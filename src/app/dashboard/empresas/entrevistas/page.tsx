import { Metadata } from "next";
import { cookies } from "next/headers";

import { UserRole } from "@/config/roles";
import { EntrevistasDashboard } from "@/theme/dashboard/components/admin/lista-entrevistas";
import { RecruiterEntrevistasDashboard } from "@/theme/dashboard/components/recrutador/entrevistas";

export const metadata: Metadata = {
  title: "Entrevistas | Dashboard",
  description: "Gerencie entrevistas do módulo de recrutamento",
};

async function getUserRoleFromCookie(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user_role")?.value;

  if (!raw) return null;
  if (raw === "PSICOLOGO") return UserRole.RECRUTADOR;

  const validRoles = Object.values(UserRole);
  return validRoles.includes(raw as UserRole) ? (raw as UserRole) : null;
}

export default async function EntrevistasPage() {
  const role = await getUserRoleFromCookie();

  if (role === UserRole.RECRUTADOR) {
    return <RecruiterEntrevistasDashboard />;
  }

  return <EntrevistasDashboard />;
}
