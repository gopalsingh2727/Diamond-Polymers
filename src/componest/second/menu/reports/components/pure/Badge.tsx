/**
 * Pure CSS Badge Component - No Tailwind, No ShadCN
 */

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variantClass = `badge-${variant}`;

  return <span className={`badge ${variantClass} ${className}`}>{children}</span>;
}
