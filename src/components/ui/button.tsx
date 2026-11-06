import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function Button({ className, variant = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' }) {
  return <button data-slot="button" className={twMerge(clsx('button', variant === 'outline' && 'button-outline', variant === 'ghost' && 'button-ghost', className))} {...props} />;
}
