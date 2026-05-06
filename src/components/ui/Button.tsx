'use client';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './index';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'surface';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, size = 'md', children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 tap select-none disabled:opacity-40 disabled:cursor-not-allowed';
    const sizes = { 
      sm: 'px-4 py-2 text-sm rounded-xl', 
      md: 'px-6 py-3 text-[15px] rounded-2xl', 
      lg: 'px-8 py-4 text-base rounded-2xl' 
    };
    const variants = {
      primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98]',
      surface: 'bg-secondary text-secondary-foreground border border-border hover:bg-muted active:scale-[0.98]',
      ghost:   'text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-[0.98]',
      danger:  'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98]',
    };
    return (
      <button ref={ref} disabled={disabled || isLoading} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
        {isLoading && <Spinner size={18} className="text-current" />}
        {children}
      </button>
    );

  }
);
Button.displayName = 'Button';