import { Metadata } from "next";
import { CandidatosDashboard } from "@/theme/dashboard/components/admin/lista-candidatos";

export const metadata: Metadata = {
  title: "Candidatos | Dashboard",
  description: "Gerencie candidatos e suas candidaturas",
};

export default function CandidatosPage() {
  return <CandidatosDashboard />;
}


