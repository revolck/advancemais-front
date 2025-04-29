import React, { useRef, useEffect, useState } from 'react';
import SidebarLogo from './logo';
import Navmenu from './Navmenu';
import { menuItems } from '@/constant/dashboard/data';
import SimpleBar from 'simplebar-react';
import useSidebar from '@/hooks/dashboard/useSidebar';
import useSemiDark from '@/hooks/dashboard/useSemiDark';
import useSkin from '@/hooks/dashboard/useSkin';

const Sidebar: React.FC = () => {
  const scrollableNodeRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableNodeRef.current && scrollableNodeRef.current.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };

    if (scrollableNodeRef.current) {
      scrollableNodeRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollableNodeRef.current) {
        scrollableNodeRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollableNodeRef]);

  const [collapsed, setMenuCollapsed] = useSidebar();
  const [menuHover, setMenuHover] = useState<boolean>(false);

  // semi dark option
  const [isSemiDark] = useSemiDark();
  // skin
  const [skin] = useSkin();

  return (
    <div className={isSemiDark ? 'dark' : ''}>
      <div
        className={`sidebar-wrapper bg-white dark:bg-slate-800 ${
          collapsed ? 'w-[72px] close_sidebar' : 'w-[248px]'
        } ${menuHover ? 'sidebar-hovered' : ''} ${
          skin === 'bordered' ? 'border-r border-slate-200 dark:border-slate-700' : 'shadow-base'
        }`}
        onMouseEnter={() => {
          setMenuHover(true);
        }}
        onMouseLeave={() => {
          setMenuHover(false);
        }}
      >
        <SidebarLogo menuHover={menuHover} />
        <div
          className={`h-[60px] absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
            scroll ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>

        <SimpleBar
          className="sidebar-menu px-4 h-[calc(100%-80px)]"
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          <Navmenu menus={menuItems} />
          {!collapsed && (
            <div className="bg-slate-900 mb-16 mt-24 p-4 relative text-center rounded-2xl text-white">
              <img
                src="/assets/images/svg/rabit.svg"
                alt=""
                className="mx-auto relative -mt-[73px]"
              />
              <div className="max-w-[160px] mx-auto mt-6">
                <div className="widget-title">Unlimited Access</div>
                <div className="text-xs font-light">Upgrade your system to business plan</div>
              </div>
              <div className="mt-6">
                <button className="btn bg-white hover:bg-opacity-80 text-slate-900 btn-sm w-full block">
                  Upgrade
                </button>
              </div>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  );
};

export default Sidebar;
