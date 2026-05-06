"use client";

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '../../../components/auth/LoginForm';

function SessionNotice() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  
  if (reason !== 'session_expired') return null

  return (
    <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 animate-fade-in">
      <div className="flex items-center gap-3 text-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
        </svg>
        <p className="text-[13px] font-bold leading-tight">
          Session Secured & Cleared<br/>
          <span className="text-[11px] font-medium opacity-80">Reloading clears your private key for safety. Please sign in again.</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-100 relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-5 mb-12">
          <div className="w-20 h-20 rounded-[30px] flex items-center justify-center bg-secondary/30 border border-primary/20 shadow-[0_0_50px_rgba(108,99,255,0.15)] backdrop-blur-md">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" fillOpacity="0.15"/>
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="7" y="11" width="2" height="2" rx="1" fill="currentColor"/>
              <rect x="11" y="11" width="2" height="2" rx="1" fill="currentColor"/>
              <rect x="15" y="11" width="2" height="2" rx="1" fill="currentColor"/>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground tracking-tighter">Confession Box</h1>
            <div className="flex items-center gap-2 mt-2 justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-primary" />
               <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Private By Design</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-4xl p-8 glass-card shadow-2xl shadow-black/20">
          <Suspense>
            <SessionNotice />
          </Suspense>
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-[13px] font-medium text-muted-foreground mt-1">Access your secure, encrypted workspace</p>
          </div>
          <LoginForm />
        </div>

        <p className="text-center text-[14px] text-muted-foreground mt-8">
          New to Confession Box?{' '}
          <Link href="/register" className="text-primary font-bold hover:brightness-125 transition-all">
            Join the collective
          </Link>
        </p>
      </div>
    </main>
  );
}