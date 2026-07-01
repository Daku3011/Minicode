import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('minicode_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ['/', '/login', '/problems', '/leaderboard', '/hackathons', '/faq', '/terms', '/privacy', '/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/faculty/:path*', '/profile/:path*', '/progress/:path*'],
};
