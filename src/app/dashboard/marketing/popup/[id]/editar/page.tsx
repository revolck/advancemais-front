import { PopupEditorShell } from "@/theme/dashboard/components/marketing/popups";

interface EditMarketingPopupPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMarketingPopupPage({
  params,
}: EditMarketingPopupPageProps) {
  const { id } = await params;
  return <PopupEditorShell popupId={id} />;
}
