import { PopupLeadDetailsView } from "@/theme/dashboard/components/marketing/contacts";

interface MarketingContatoDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketingContatoDetailsPage({
  params,
}: MarketingContatoDetailsPageProps) {
  const { id } = await params;

  return <PopupLeadDetailsView leadId={id} />;
}
