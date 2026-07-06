import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('sb-access-token');
  const userRole = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/mp') || pathname.startsWith('/admin');
  
  if (isProtectedPath && !sessionCookie) {
    if (pathname.startsWith('/mp')) {
      return NextResponse.redirect(new URL('/auth/mp', request.url));
    }
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/admin', request.url));
    }
    return NextResponse.redirect(new URL('/auth/citizen', request.url));
  }

  if (sessionCookie && userRole) {
    if (pathname.startsWith('/dashboard') && userRole !== 'citizen') {
      const redirectUrl = userRole === 'mp' ? '/mp' : '/admin';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    if (pathname.startsWith('/mp') && userRole !== 'mp') {
      const redirectUrl = userRole === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const redirectUrl = userRole === 'mp' ? '/mp' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    if (pathname.startsWith('/auth')) {
      const redirectUrl = userRole === 'admin' ? '/admin' : (userRole === 'mp' ? '/mp' : '/dashboard');
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/mp/:path*', '/admin/:path*', '/auth/:path*'],
};
