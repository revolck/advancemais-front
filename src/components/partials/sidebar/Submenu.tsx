import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/icon';

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
  icon?: string; // Made icon optional
  link?: string;
  badge?: string;
  child?: ChildItem[];
  isHeadr?: boolean;
  isOpen?: boolean;
  isHide?: boolean;
}

interface SubmenuProps {
  activeSubmenu: number | null;
  item: MenuItem;
  i: number;
  locationName: string;
}

const Submenu: React.FC<SubmenuProps> = ({ activeSubmenu, item, i, locationName }) => {
  return (
    <>
      {item.child && activeSubmenu === i && (
        <ul className="sub-menu">
          {item.child.map((subItem, j) => (
            <li key={j} className={locationName === subItem.childlink ? 'menu-item-active' : ''}>
              {!subItem.multi_menu ? (
                <Link href={subItem.childlink} className="sub-item-link">
                  {subItem.childtitle}
                </Link>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-black dark:text-white">
                      <Icon icon="ChevronRight" />
                    </span>
                    <div className="flex-1 text-slate-500 dark:text-slate-300 capitalize text-sm leading-[28px] font-medium">
                      {subItem.childtitle}
                    </div>
                  </div>
                  <ul className="ml-4">
                    {subItem.multi_menu.map((mItem, index) => (
                      <li
                        key={index}
                        className={locationName === mItem.multiLink ? 'menu-item-active' : ''}
                      >
                        <Link href={mItem.multiLink}>{mItem.multiTitle}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Submenu;
