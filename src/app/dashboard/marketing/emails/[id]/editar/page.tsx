import { EmailEditorShell } from "@/theme/dashboard/components/marketing/emailsmarketing/EmailEditorShell";

export default async function MarketingEmailsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EmailEditorShell emailId={id} />;
}
