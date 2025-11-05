import { Metadata } from "next";
import { UsuariosDashboard } from "@/theme/dashboard/components/admin/lista-usuarios";

export const metadata: Metadata = {
  title: "Usuários | Dashboard",
  description: "Gerencie usuários e suas permissões",
};

export default function UsuariosPage() {
  return <UsuariosDashboard />;
}
