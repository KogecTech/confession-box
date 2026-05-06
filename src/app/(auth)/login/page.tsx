import Link from 'next/link';
import { LoginForm } from '../../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-[#0d0d0f]">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#6c63ff]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[360px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6c63ff22, #6c63ff11)', border: '1px solid #6c63ff33', boxShadow: '0 0 40px #6c63ff18' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#6c63ff" opacity="0.2"/>
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke="#6c63ff" strokeWidth="1.5" fill="none"/>
              <rect x="7" y="11" width="2" height="2" rx="1" fill="#6c63ff"/>
              <rect x="11" y="11" width="2" height="2" rx="1" fill="#6c63ff"/>
              <rect x="15" y="11" width="2" height="2" rx="1" fill="#6c63ff"/>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#f0f0f5] tracking-tight">WhisperBox</h1>
            <p className="text-sm text-[#55556a] mt-1">Private by design</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6" style={{ background: '#17171a', border: '1px solid #2a2a33' }}>
          <h2 className="text-lg font-semibold text-[#f0f0f5] mb-1">Welcome back</h2>
          <p className="text-sm text-[#55556a] mb-6">Sign in to your encrypted inbox</p>
          <LoginForm />
        </div>

        <p className="text-center text-sm text-[#55556a] mt-6">
          No account?{' '}
          <Link href="/register" className="text-[#6c63ff] font-medium hover:text-[#7a72ff] transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}