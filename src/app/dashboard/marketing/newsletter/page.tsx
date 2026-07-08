import { redirect } from "next/navigation";

export default function MarketingNewsletterRedirectPage() {
  redirect("/dashboard/marketing/emails");
}
