import { redirect } from 'next/navigation';

export default function DashboardIndexPage() {
  // Redireciona para a página analytics
  redirect('/analytics');
}
