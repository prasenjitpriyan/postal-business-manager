import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = ['/', '/login', '/api/auth/login', '/signup', '/api/auth/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // We are relying on the Authorization header for API requests
  // For page requests, we might need a cookie. Since the requirements didn't enforce cookies,
  // we'll check for a token in the cookies as well for page navigation if we implement it.
  const token = request.headers.get('Authorization')?.split(' ')[1] || request.cookies.get('token')?.value;

  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifyToken(token);

  if (!session) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role based protection example for API
  if (pathname.startsWith('/api/auth/register') && session.role !== 'Admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
