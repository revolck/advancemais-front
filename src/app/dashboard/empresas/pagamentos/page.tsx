import { Metadata } from "next";
import { PagamentosDashboard } from "@/theme/dashboard/components/admin/lista-pagamentos";

export const metadata: Metadata = {
  title: "Assinatura | Dashboard",
  description: "Gerenciamento de assinatura, cartões e histórico de pagamentos",
};

export default function AssinaturaPage() {
  return <PagamentosDashboard />;
}

