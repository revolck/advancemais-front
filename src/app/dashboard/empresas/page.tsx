import { PageWrapper } from "@/components/layout/PageWrapper";
import { CompanyDashboard } from "@/theme/dashboard/components/admin";

export default function AdminCompaniesListPage() {
  return (
    <PageWrapper className="space-y-8 pb-12" maxWidth="xl">
      <CompanyDashboard />
    </PageWrapper>
  );
}
