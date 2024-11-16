// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('🟡 [Middleware] Starting', {
    path: req.nextUrl.pathname,
    cookies: req.cookies.getAll() // Log cookies for debugging
  });

  if (!req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    console.log('🟡 [Middleware] Session check:', {
      hasSession: !!session,
      sessionId: session?.access_token?.slice(-10) || 'none'
    });

    if (!session) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return res;
  } catch (error) {
    console.error('🔴 [Middleware] Error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
};
