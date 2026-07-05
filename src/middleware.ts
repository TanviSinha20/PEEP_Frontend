import { NextRequest, NextResponse } from 'next/server';

// Protected route prefixes and their required roles
const ROLE_ROUTES: Record<string, string> = {
  '/patient':  'patient',
  '/doctor':   'doctor',
  '/hospital': 'hospital_partner',
  '/onboarding': 'patient',
};

// Routes that are always public (no auth needed)
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

function dashboardFor(role: string): string {
  switch (role) {
    case 'patient':          return '/patient/dashboard';
    case 'doctor':           return '/doctor/dashboard';
    case 'hospital_partner': return '/hospital/dashboard';
    default:                 return '/auth/login';
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Allow Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static assets
  ) {
    return NextResponse.next();
  }

  const token    = request.cookies.get('access_token')?.value;
  const role     = request.cookies.get('user_role')?.value;
  const userAge  = request.cookies.get('user_age')?.value;

  // 1. Unauthenticated → redirect to login
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Patient without onboarding → force onboarding (unless already there)
  if (
    role === 'patient' &&
    (userAge === 'null' || !userAge) &&
    pathname !== '/onboarding'
  ) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // 3. Role-based route guards
  for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix) && role !== requiredRole) {
      return NextResponse.redirect(new URL(dashboardFor(role || ''), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
