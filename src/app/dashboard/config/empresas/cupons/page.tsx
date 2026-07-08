import { redirect } from "next/navigation";

export default function EmpresasCuponsRedirectPage() {
  redirect("/dashboard/config/geral?tab=cupons");
}
