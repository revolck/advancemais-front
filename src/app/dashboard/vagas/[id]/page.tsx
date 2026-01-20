import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@/config/roles";

interface VagaRedirectPageProps {
  params: Promise<{ id: string }>;
}

async function getUserRoleFromCookie(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user_role")?.value;
  if (!raw) return null;

  if (raw === "PSICOLOGO") return UserRole.RECRUTADOR;

  const validRoles = Object.values(UserRole);
  return validRoles.includes(raw as UserRole) ? (raw as UserRole) : null;
}

export default async function VagaRedirectPage({
  params,
}: VagaRedirectPageProps) {
  const { id } = await params;

  const role = await getUserRoleFromCookie();
  const encodedId = encodeURIComponent(id);

  if (role === UserRole.ALUNO_CANDIDATO) {
    redirect(`/vagas/${encodedId}`);
  }

  redirect(`/dashboard/empresas/vagas/${encodedId}`);
}
