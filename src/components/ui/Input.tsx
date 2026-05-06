'use client';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-[#9090a8] uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#55556a]">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-[#1e1e23] border rounded-2xl py-3.5 text-[15px] text-[#f0f0f5]
            placeholder:text-[#55556a] outline-none transition-all duration-200
            ${icon ? 'pl-11 pr-4' : 'px-4'}
            ${error
              ? 'border-[#ff4f4f] focus:ring-2 focus:ring-[#ff4f4f]/20'
              : 'border-[#2a2a33] focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/15'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#ff4f4f] flex items-center gap-1">⚠ {error}</p>}
    </div>
  )
);
Input.displayName = 'Input';