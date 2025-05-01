import DashHeader from '@/components/partials/dashboard/layout/header';
import DashSidebar from '@/components/partials/dashboard/layout/sidebar';
import LayoutProvider from '@/providers/layout.provider';
import LayoutContentProvider from '@/providers/content.provider';

const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutProvider>
      <DashHeader />
      <DashSidebar />
      <LayoutContentProvider>{children}</LayoutContentProvider>
    </LayoutProvider>
  );
};

export default layout;
