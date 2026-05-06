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
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em] ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-secondary/50 border rounded-[18px] py-3.5 text-[15px] text-foreground
            placeholder:text-muted-foreground/40 outline-none transition-all duration-300
            ${icon ? 'pl-11 pr-5' : 'px-5'}
            ${error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-border/60 focus:border-primary/50 focus:bg-secondary/80 focus:ring-4 focus:ring-primary/10'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[11px] font-bold text-red-500 flex items-center gap-1.5 ml-1 mt-1 animate-shake">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
);

Input.displayName = 'Input';