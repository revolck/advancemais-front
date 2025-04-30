'use client';

import React from 'react';
import HeaderContent from './header-content';
import ProfileInfo from './profile-info';
import Notifications from './notifications';
import Messages from './messages';

const DashHeader = () => {
  return (
    <>
      <HeaderContent>
        {/* Mobile Logo */}
        <div className="flex gap-3 items-center"></div>
        <div className="nav-tools flex items-center md:gap-4 gap-3">
          <Messages />
          <Notifications />
          <ProfileInfo />
        </div>
      </HeaderContent>
    </>
  );
};

export default DashHeader;
