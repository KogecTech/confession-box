'use client';

import {
  generateKeyPair,
  generateSalt,
  deriveWrappingKey,
  wrapPrivateKey,
  exportPublicKey,
} from '../../lib/crypto/keys';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      await register(username.trim(), displayName.trim(), password);
      router.replace('/inbox'); // ← go to /inbox not /
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <Input
        label="Display Name"
        placeholder="Alice"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
      />
      <Input
        label="Username"
        placeholder="alice_92"
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
        autoComplete="username"
        minLength={3}
        maxLength={32}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        minLength={8}
        required
      />
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-500 font-medium animate-shake">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        </div>
      )}
      <Button type="submit" isLoading={isLoading} className="w-full mt-2 h-12 text-base shadow-xl">
        {isLoading ? 'Securing Identity…' : 'Initialize Account'}
      </Button>
      <div className="mt-4 p-4 rounded-2xl bg-secondary/30 border border-border/40">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
            Your encryption keys are generated locally. Confession Box servers never see your private key or password.
          </p>
        </div>
      </div>

    </form>
  );
}