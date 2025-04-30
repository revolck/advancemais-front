'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ className, icon: LucideIcon, size = 24, strokeWidth = 2, color, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('inline-flex', className)} {...props}>
        <LucideIcon size={size} strokeWidth={strokeWidth} color={color} />
      </div>
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };
