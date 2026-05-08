import type { AdminCompanyDetail } from "@/api/empresas/admin/types";
import { formatCnpj } from "../../../utils";

interface EmpresaResumoCardProps {
  company: AdminCompanyDetail;
}

export function EmpresaResumoCard({ company }: EmpresaResumoCardProps) {
  const formattedCnpj = formatCnpj(company.cnpj);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 pb-2">
      <p className="!font-semibold !text-slate-900 !mb-0 !text-base">
        {company.nome}
      </p>
      {formattedCnpj !== "—" && (
        <p className="!text-xs !text-slate-500">CNPJ: {formattedCnpj}</p>
      )}
    </div>
  );
}
