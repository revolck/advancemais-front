import type { Metadata } from "next";

import PricingPlans from "@/theme/website/components/pricing-plans";

export const metadata: Metadata = {
  title: "Upgrade | Dashboard",
  description: "Gerencie e altere seu plano empresarial.",
};

export default function DashboardUpgradePage() {
  return (
    <PricingPlans
      title="Upgrade do plano"
      subtitle="Seu plano atual já fica marcado. Você pode fazer upgrade ou downgrade quando quiser."
      fetchFromApi
      className="py-1"
    />
  );
}
