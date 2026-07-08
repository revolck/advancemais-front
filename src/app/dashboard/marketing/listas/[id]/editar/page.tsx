import { RecipientListEditorPage } from "@/theme/dashboard/components/marketing/recipientlists";

export default async function MarketingRecipientListsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RecipientListEditorPage listId={id} />;
}
