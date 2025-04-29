import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/icon';
// import { toggleActiveChat } from '@/components/partials/app/chat/store';
import { useDispatch } from 'react-redux';
import useMobileMenu from '@/hooks/dashboard/useMobileMenu';
import Submenu from './Submenu';
import { AppDispatch } from '@/store';

interface ChildItem {
  childlink: string;
  childtitle: string;
  multi_menu?: {
    multiLink: string;
    multiTitle: string;
  }[];
}

interface MenuItem {
  title: string;
  icon?: string;
  link?: string;
  badge?: string;
  child?: ChildItem[];
  isHeadr?: boolean;
  isOpen?: boolean;
  isHide?: boolean;
}

interface NavmenuProps {
  menus: MenuItem[];
}

const Navmenu: React.FC<NavmenuProps> = ({ menus }) => {
  const router = useRouter();
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  const toggleSubmenu = (i: number) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(i);
    }
  };

  const location = usePathname();
  const locationName = location ? location.replace('/', '') : '';

  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let submenuIndex = null;
    menus.forEach((item, i) => {
      if (!item.child) return;
      if (item.link === locationName) {
        submenuIndex = null;
      } else {
        const ciIndex = item.child.findIndex(ci => ci.childlink === locationName);
        if (ciIndex !== -1) {
          submenuIndex = i;
        }
      }
    });

    setActiveSubmenu(submenuIndex);
    // dispatch(toggleActiveChat(false));
    if (mobileMenu) {
      setMobileMenu(false);
    }
  }, [router, location, dispatch, mobileMenu, setMobileMenu, menus, locationName]);

  return (
    <>
      <ul>
        {menus.map((item, i) => (
          <li
            key={i}
            className={`single-sidebar-menu 
              ${item.child ? 'item-has-children' : ''}
              ${activeSubmenu === i ? 'open' : ''}
              ${locationName === item.link ? 'menu-item-active' : ''}`}
          >
            {/* single menu with no children*/}
            {!item.child && !item.isHeadr && item.icon && (
              <Link className="menu-link" href={item.link || '#'}>
                <span className="menu-icon flex-grow-0">
                  <Icon icon={item.icon as any} />
                </span>
                <div className="text-box flex-grow">{item.title}</div>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </Link>
            )}
            {/* only for menulabel */}
            {item.isHeadr && !item.child && <div className="menulabel">{item.title}</div>}
            {/*    !!sub menu parent   */}
            {item.child && item.icon && (
              <div
                className={`menu-link ${
                  activeSubmenu === i ? 'parent_active not-collapsed' : 'collapsed'
                }`}
                onClick={() => toggleSubmenu(i)}
              >
                <div className="flex-1 flex items-start">
                  <span className="menu-icon">
                    <Icon icon={item.icon as any} />
                  </span>
                  <div className="text-box">{item.title}</div>
                </div>
                <div className="flex-0">
                  <div
                    className={`menu-arrow transform transition-all duration-300 ${
                      activeSubmenu === i ? 'rotate-90' : ''
                    }`}
                  >
                    <Icon icon="ChevronRight" />
                  </div>
                </div>
              </div>
            )}

            <Submenu activeSubmenu={activeSubmenu} item={item} i={i} locationName={locationName} />
          </li>
        ))}
        <li className="single-sidebar-menu">
          <a
            href="https://dashcode-react-doc.codeshaper.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="menu-link"
          >
            <span className="menu-icon">
              <Icon icon="FileText" />
            </span>
            <div className="text-box">Documentation</div>
          </a>
        </li>
      </ul>
    </>
  );
};

export default Navmenu;
