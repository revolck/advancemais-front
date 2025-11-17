"use client";

import { useRouter } from "next/navigation";
import { CreateUsuarioForm } from "@/theme/dashboard/components/admin/lista-usuarios/components/CreateUsuarioForm";

export default function CadastrarUsuarioPage() {
  const router = useRouter();
  return (
    <CreateUsuarioForm
      onSuccess={() => router.push("/dashboard/usuarios")}
      onCancel={() => router.push("/dashboard/usuarios")}
    />
  );
}

