import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import {
  getAdminCompanyById,
  listAdminCompanyPayments,
  listAdminCompanyBans,
  listAdminCompanyVacancies,
} from "@/api/empresas/admin";
import { CompanyDetailsView } from "@/theme/dashboard/components/admin";

interface CompanyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailsPage(
  props: CompanyDetailsPageProps
) {
  const { id } = await props.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [companyResult, paymentsResult, bansResult, vacanciesResult] =
    await Promise.allSettled([
      getAdminCompanyById(id, { headers: authHeaders }),
      listAdminCompanyPayments(id, { pageSize: 20 }, { headers: authHeaders }),
      listAdminCompanyBans(id, { pageSize: 20 }, { headers: authHeaders }),
      listAdminCompanyVacancies(id, { pageSize: 20 }, { headers: authHeaders }),
    ]);

  if (companyResult.status !== "fulfilled") {
    console.error("Erro ao carregar detalhes da empresa", companyResult.reason);
    notFound();
  }

  // Verificar se a resposta é um erro
  if (!("empresa" in companyResult.value)) {
    console.error("Erro na resposta da API:", companyResult.value);
    notFound();
  }

  const empresa = companyResult.value.empresa;
  const payments =
    paymentsResult.status === "fulfilled" && "data" in paymentsResult.value
      ? paymentsResult.value.data
      : [];
  const bans =
    bansResult.status === "fulfilled" && "data" in bansResult.value
      ? bansResult.value.data
      : [];
  const vacancies =
    vacanciesResult.status === "fulfilled" && "data" in vacanciesResult.value
      ? vacanciesResult.value.data
      : [];

  return (
    <CompanyDetailsView
      company={empresa}
      payments={payments}
      bans={bans}
      vacancies={vacancies}
    />
  );
}
