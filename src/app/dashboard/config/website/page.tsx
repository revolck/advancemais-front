import { WebsiteFeatures } from "@/theme/dashboard/components/admin";
import { DashboardHeader } from '@/components/layout';

export default function AdminWebsitePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <WebsiteFeatures />
    </div>
  );
}