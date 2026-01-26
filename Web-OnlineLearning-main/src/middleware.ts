import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

// Role constants
const ROLES = {
  STUDENT: 'ROLE_STUDENT',
  INSTRUCTOR: 'ROLE_INSTRUCTOR',
};

// Define protected routes with required roles
const PROTECTED_ROUTES = {
  // Student routes
  '/student-profile': [ROLES.STUDENT, ROLES.INSTRUCTOR],
  '/student-enrolled-courses': [ROLES.STUDENT, ROLES.INSTRUCTOR],
  '/student-wishlist': [ROLES.STUDENT, ROLES.INSTRUCTOR],
  '/course-lesson': [ROLES.STUDENT, ROLES.INSTRUCTOR],
  '/course-program-lesson': [ROLES.STUDENT, ROLES.INSTRUCTOR],
  '/cart': [ROLES.STUDENT, ROLES.INSTRUCTOR],
  '/quizzes': [ROLES.STUDENT, ROLES.INSTRUCTOR],

  // Instructor routes (only instructors)
  '/instructor-courses': [ROLES.INSTRUCTOR],
  '/instructor-profile': [ROLES.INSTRUCTOR],
  '/create-course': [ROLES.INSTRUCTOR],
  '/update-course': [ROLES.INSTRUCTOR],
  '/update-group-course': [ROLES.INSTRUCTOR],
  '/create-group-course': [ROLES.INSTRUCTOR],
  '/quizzes/create': [ROLES.INSTRUCTOR],
};

// Routes that require authentication but no specific role
const AUTH_REQUIRED_ROUTES = ['/checkout', '/my-courses', '/settings'];

// Create custom routing configuration that respects cookie preference
const createCustomRouting = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already has a locale
  const localeMatch = pathname.match(/^\/(en|vi)/);

  if (!localeMatch) {
    // No locale in URL, try to get from cookie
    const preferredLocale = request.cookies.get('preferredLocale')?.value;

    // If user has a preferred locale saved in cookies, use it
    if (preferredLocale && ['en', 'vi'].includes(preferredLocale)) {
      // Create a new request with the preferred locale prepended
      const newUrl = new URL(request.url);
      newUrl.pathname = `/${preferredLocale}${pathname}`;
      const redirectResponse = NextResponse.redirect(newUrl);
      // Ensure the cookie is preserved in the redirect response
      redirectResponse.cookies.set('preferredLocale', preferredLocale, {
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax',
      });
      return redirectResponse;
    }
  }

  return null;
};

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Try custom routing with cookie preference first
  const customRoutingResponse = createCustomRouting(request);
  if (customRoutingResponse) {
    return customRoutingResponse;
  }

  // Then apply standard i18n middleware
  const response = intlMiddleware(request);

  // Ensure preferredLocale cookie is preserved in the response
  const localeMatch = pathname.match(/^\/(en|vi)/);
  if (localeMatch) {
    const locale = localeMatch[1];
    response.cookies.set('preferredLocale', locale, {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
    });
  }

  // Extract locale from pathname (e.g., /en/dashboard -> /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi)/, '') || '/';

  // Get user data from cookies or headers (server-side accessible storage)
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;

  let userRoles: string[] = [];

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      userRoles = user.roles || [];
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
  }

  // Check if route requires specific roles
  const matchedRoute = Object.keys(PROTECTED_ROUTES).find(route =>
    pathnameWithoutLocale.startsWith(route),
  );

  if (matchedRoute) {
    const requiredRoles = PROTECTED_ROUTES[matchedRoute as keyof typeof PROTECTED_ROUTES];

    // User not logged in
    if (!token) {
      const locale = pathname.match(/^\/(en|vi)/)?.[1] || 'vi';
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
    }

    // Check if user has required role
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user's roles
      const locale = pathname.match(/^\/(en|vi)/)?.[1] || 'vi';

      if (userRoles.includes(ROLES.INSTRUCTOR)) {
        return NextResponse.redirect(new URL(`/${locale}/instructor-profile`, request.url));
      } else if (userRoles.includes(ROLES.STUDENT)) {
        return NextResponse.redirect(new URL(`/${locale}/student-profile`, request.url));
      } else {
        return NextResponse.redirect(new URL(`/${locale}/`, request.url));
      }
    }
  }

  // Check if route requires authentication (but no specific role)
  const requiresAuth = AUTH_REQUIRED_ROUTES.some(route => pathnameWithoutLocale.startsWith(route));

  if (requiresAuth && !token) {
    const locale = pathname.match(/^\/(en|vi)/)?.[1] || 'vi';
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  }

  // If user is logged in and tries to access sign-in/sign-up, redirect to dashboard
  if (token && (pathnameWithoutLocale === '/sign-in' || pathnameWithoutLocale === '/sign-up')) {
    const locale = pathname.match(/^\/(en|vi)/)?.[1] || 'vi';

    // Redirect based on role
    if (userRoles.includes(ROLES.INSTRUCTOR)) {
      return NextResponse.redirect(new URL(`/${locale}/instructor-profile`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/${locale}/student-profile`, request.url));
    }
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
