import LayoutProvider from '@/providers/layout.provider';
import LayoutContentProvider from '@/providers/content.provider';
import DashCodeSidebar from '@/components/partials/dashboard/layout/sidebar';
import DashCodeFooter from '@/components/partials/dashboard/layout/footer';
import ThemeCustomize from '@/components/partials/dashboard/layout/customizer';
import DashCodeHeader from '@/components/partials/dashboard/layout/header';
const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutProvider>
      <ThemeCustomize />
      <DashCodeHeader />
      <DashCodeSidebar />
      <LayoutContentProvider>{children}</LayoutContentProvider>
      <DashCodeFooter />
    </LayoutProvider>
  );
};

export default layout;
