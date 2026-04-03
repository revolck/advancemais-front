import { cookies } from "next/headers";

import { UserRole } from "@/config/roles";
import { CompanyDashboard } from "@/theme/dashboard/components/admin";
import { RecruiterCompaniesDashboard } from "@/theme/dashboard/components/recrutador/companies/RecruiterCompaniesDashboard";

async function getUserRoleFromCookie(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user_role")?.value;

  if (!raw) return null;
  if (raw === "PSICOLOGO") return UserRole.RECRUTADOR;

  const validRoles = Object.values(UserRole);
  return validRoles.includes(raw as UserRole) ? (raw as UserRole) : null;
}

export default async function CompaniesListPage() {
  const role = await getUserRoleFromCookie();

  return (
    <div className="space-y-8">
      {role === UserRole.RECRUTADOR ? (
        <RecruiterCompaniesDashboard />
      ) : (
        <CompanyDashboard />
      )}
    </div>
  );
}
