import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware only handles one job: redirect bare "/" to "/login".
// All real auth protection is in (app)/layout.tsx client-side,
// because the access token lives in memory — not in cookies.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect bare root to login — the app shell is at /inbox
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};