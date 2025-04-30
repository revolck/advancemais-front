import DashHeader from '@/components/partials/dashboard/layout/header';

const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashHeader />
      {children}
    </>
  );
};

export default layout;
