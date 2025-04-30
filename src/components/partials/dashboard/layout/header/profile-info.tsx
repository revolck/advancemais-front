'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import Link from 'next/link';
import { User, ChevronDown, Megaphone, UserPlus, Users, Power } from 'lucide-react';

const ProfileInfo = () => {
  const userProfile = {
    name: 'Filipe Reis Marques',
    email: 'filipe@revolck.com.br',
    image: '/placeholder-profile.jpg',
  };

  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <div className="flex items-center gap-3 text-default-800">
            <Image
              src={userProfile.image}
              alt={userProfile.name.charAt(0)}
              width={36}
              height={36}
              className="rounded-full"
            />

            <div className="text-sm font-medium capitalize lg:block hidden">{userProfile.name}</div>
            <span className="text-base me-2.5 lg:inline-block hidden">
              <ChevronDown size={16} />
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
            <Image
              src={userProfile.image}
              alt={userProfile.name.charAt(0)}
              width={36}
              height={36}
              className="rounded-full"
            />

            <div>
              <div className="text-sm font-medium text-default-800 capitalize">
                {userProfile.name}
              </div>
              <Link href="/dashboard" className="text-xs text-default-600 hover:text-primary">
                {userProfile.email}
              </Link>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {[
              {
                name: 'Minha conta',
                icon: <User size={16} />,
                href: '/user-profile',
              },
              {
                name: 'Pagamentos',
                icon: <Megaphone size={16} />,
                href: '/dashboard',
              },
            ].map((item, index) => (
              <Link href={item.href} key={`info-menu-${index}`} className="cursor-pointer">
                <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 cursor-pointer">
                  {item.icon}
                  {item.name}
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/dashboard" className="cursor-pointer">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 cursor-pointer">
                <Users size={16} />
                Team
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5">
                <UserPlus size={16} />
                Invite user
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {[{ name: 'Email' }, { name: 'Message' }, { name: 'Facebook' }].map(
                    (item, index) => (
                      <Link
                        href="/dashboard"
                        key={`message-sub-${index}`}
                        className="cursor-pointer"
                      >
                        <DropdownMenuItem className="text-sm font-medium text-default-600 capitalize px-3 py-1.5 cursor-pointer">
                          {item.name}
                        </DropdownMenuItem>
                      </Link>
                    )
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer">
            <button type="button" className="w-full flex items-center gap-2">
              <Power size={16} />
              Sair
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileInfo;
