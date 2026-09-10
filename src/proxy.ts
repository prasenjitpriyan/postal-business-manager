import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const publicPages = [
  '/',
  '/login',
  '/signup',
  '/privacy',
  '/terms',
  '/contact',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/icon.png',
  '/apple-icon.png',
  '/twitter-image.png',
  '/opengraph-image.png',
];
const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicPages.includes(pathname) ||
    publicApiRoutes.includes(pathname) ||
    /\.(?:png|jpg|jpeg|gif|svg|ico|webp|json|xml|txt)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Allow unauthenticated visitors to submit contact messages
  if (pathname === '/api/contact' && request.method === 'POST') {
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
  if (pathname.startsWith('/api/auth/register') && session.role !== 'Admin' && session.role !== 'Super Admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|json|txt|xml)$).*)'],
};

