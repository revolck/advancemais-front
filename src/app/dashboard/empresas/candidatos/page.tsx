import { Metadata } from "next";
import { cookies } from "next/headers";

import { UserRole } from "@/config/roles";
import { CandidatosDashboard } from "@/theme/dashboard/components/admin/lista-candidatos";
import { RecruiterCandidatosDashboard } from "@/theme/dashboard/components/recrutador/candidatos";

export const metadata: Metadata = {
  title: "Candidatos | Dashboard",
  description: "Gerencie candidatos e suas candidaturas",
};

async function getUserRoleFromCookie(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user_role")?.value;

  if (!raw) return null;
  if (raw === "PSICOLOGO") return UserRole.RECRUTADOR;

  const validRoles = Object.values(UserRole);
  return validRoles.includes(raw as UserRole) ? (raw as UserRole) : null;
}

export default async function CandidatosPage() {
  const role = await getUserRoleFromCookie();

  if (role === UserRole.RECRUTADOR) {
    return <RecruiterCandidatosDashboard />;
  }

  return <CandidatosDashboard />;
}

