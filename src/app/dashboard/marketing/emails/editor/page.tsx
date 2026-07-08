import { EmailEditorShell } from "@/theme/dashboard/components/marketing/emailsmarketing/EmailEditorShell";

interface MarketingEmailEditorPageProps {
  searchParams: Promise<{ template?: string }>;
}

export default async function MarketingEmailEditorPage({
  searchParams,
}: MarketingEmailEditorPageProps) {
  const params = await searchParams;
  return <EmailEditorShell templateSlug={params.template ?? "blank"} />;
}
