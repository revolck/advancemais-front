import { PopupEditorShell } from "@/theme/dashboard/components/marketing/popups";

interface MarketingPopupEditorPageProps {
  searchParams: Promise<{ template?: string }>;
}

export default async function MarketingPopupEditorPage({
  searchParams,
}: MarketingPopupEditorPageProps) {
  const params = await searchParams;
  return (
    <PopupEditorShell
      templateSlug={params.template ?? "newsletter-oportunidades"}
    />
  );
}
