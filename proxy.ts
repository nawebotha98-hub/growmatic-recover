import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from './lib/supabase/env';

// Note: this file is named `proxy.ts`, not `middleware.ts` — this project was
// scaffolded on a Next.js version where `middleware` was renamed to `proxy`
// (see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    // No database connected yet — let every page render its own
    // "connect your database" state instead of redirect-looping to /login.
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  const isPublicRoute = request.nextUrl.pathname === '/';
  // API routes check auth themselves and return a proper 401 JSON body —
  // redirecting them to /login here would hand a `fetch().json()` caller an
  // HTML redirect response instead, which is worse than just 401-ing.
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');

  if (!user && !isAuthRoute && !isPublicRoute && !isApiRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Static assets (the logo, favicon, etc.) must never require a session —
  // this bit me once already: a plain PNG under /public got caught by the
  // catch-all matcher and redirected to /login for signed-out visitors,
  // which is exactly the audience most likely to be looking at the logo
  // on the landing/login pages.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|woff2?|ttf)$).*)',
  ],
};
