import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconsProps {
  /**
   * Name of the Lucide icon, e.g. "ArrowRight", "Coffee", etc.
   */
  icon: keyof typeof LucideIcons;
  /**
   * CSS class names to apply to the icon
   */
  className?: string;
  /**
   * Size of the icon (maps to Lucide's `size` prop)
   */
  width?: number;
  /**
   * Number of 90° rotations (0–3)
   */
  rotate?: number;
  /**
   * Flip horizontally
   */
  hFlip?: boolean;
  /**
   * Flip vertically
   */
  vFlip?: boolean;
}

const Icons: React.FC<IconsProps> = ({
  icon,
  className,
  width = 24,
  rotate = 0,
  hFlip = false,
  vFlip = false,
}) => {
  // Dynamically lookup the icon component
  const IconComponent = LucideIcons[icon];
  if (
    !IconComponent ||
    (typeof IconComponent === 'function' && IconComponent.length > 1) // skip icon factory functions
  ) {
    console.warn(`Icon '${icon}' not found or is not a valid Lucide icon component`);
    return null;
  }

  // Build transform string
  const transforms: string[] = [];
  if (rotate) {
    // Iconify rotates in 90° increments
    transforms.push(`rotate(${rotate * 90}deg)`);
  }
  if (hFlip) transforms.push('scaleX(-1)');
  if (vFlip) transforms.push('scaleY(-1)');

  const style = transforms.length > 0 ? { transform: transforms.join(' ') } : undefined;

  return React.createElement(IconComponent as React.ElementType, {
    size: width,
    className,
    style,
  });
};

export default Icons;
