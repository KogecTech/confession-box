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
    const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 tap select-none disabled:opacity-40 disabled:cursor-not-allowed';
    const sizes = { sm: 'px-3 py-1.5 text-sm rounded-xl', md: 'px-5 py-3 text-[15px] rounded-2xl', lg: 'px-6 py-3.5 text-base rounded-2xl' };
    const variants = {
      primary: 'bg-gradient-to-br from-[#6c63ff] to-[#4f46cc] text-white shadow-lg shadow-[#6c63ff]/20 hover:shadow-[#6c63ff]/30 hover:from-[#7a72ff] hover:to-[#5a52dc]',
      surface: 'bg-[#1e1e23] text-[#f0f0f5] border border-[#2a2a33] hover:bg-[#26262d] hover:border-[#333340]',
      ghost:   'text-[#9090a8] hover:text-[#f0f0f5] hover:bg-[#1e1e23]',
      danger:  'bg-[#ff4f4f]/10 text-[#ff4f4f] border border-[#ff4f4f]/20 hover:bg-[#ff4f4f]/20',
    };
    return (
      <button ref={ref} disabled={disabled || isLoading} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
        {isLoading && <Spinner size={16} color="white" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';