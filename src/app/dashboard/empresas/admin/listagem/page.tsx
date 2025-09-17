import { CompanyDashboard } from "@/theme/dashboard/components/admin";
import { DashboardHeader } from "@/components/layout";

export default function AdminCompaniesListPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      <CompanyDashboard />
    </div>
  );
}
