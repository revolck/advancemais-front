import DashHeader from '@/components/partials/dashboard/layout/header';
import DashSidebar from '@/components/partials/dashboard/layout/sidebar';

const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashHeader />
      <DashSidebar />
      {children}
    </>
  );
};

export default layout;
