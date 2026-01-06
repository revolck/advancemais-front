import { redirect } from "next/navigation";

interface DashboardConfiguracoesPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function DashboardConfiguracoesPage({
  searchParams,
}: DashboardConfiguracoesPageProps) {
  const params = new URLSearchParams();

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else if (value) {
        params.set(key, value);
      }
    });
  }

  const query = params.toString();
  redirect(query ? `/dashboard?${query}` : "/dashboard");
}
