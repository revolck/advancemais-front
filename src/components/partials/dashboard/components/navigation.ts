import { createNavigation } from 'next-intl/navigation';
import { locales } from '@/configs/dashboard';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
});
