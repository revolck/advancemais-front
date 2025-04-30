import LayoutProvider from '@/providers/layout.provider';
import LayoutContentProvider from '@/providers/content.provider';
import DashCodeSidebar from '@/components/partials/dashboard/layout/sidebar';
import DashCodeHeader from '@/components/partials/dashboard/layout/header';
const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutProvider>
      <DashCodeHeader />
      {/* <DashCodeSidebar /> */}
      <LayoutContentProvider>{children}</LayoutContentProvider>
    </LayoutProvider>
  );
};

export default layout;
