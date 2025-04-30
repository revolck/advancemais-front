import React from 'react';
import HeaderContent from './header-content';
import ProfileInfo from './profile-info';
import Notifications from './notifications';
import Messages from './messages';
import { SidebarToggle } from '@/components/partials/sidebar/sidebar-toggle';
import { SheetMenu } from '@/components/partials/sidebar/menu/sheet-menu';
import HorizontalMenu from './horizontal-menu';
import HeaderLogo from './header-logo';

const DashCodeHeader = async () => {
  return (
    <>
      <HeaderContent>
        <div className=" flex gap-3 items-center">
          <HeaderLogo />
          <SidebarToggle />
        </div>
        <div className="nav-tools flex items-center  md:gap-4 gap-3">
          <Messages />
          <Notifications />
          <ProfileInfo />
          <SheetMenu />
        </div>
      </HeaderContent>
      <HorizontalMenu />
    </>
  );
};

export default DashCodeHeader;
