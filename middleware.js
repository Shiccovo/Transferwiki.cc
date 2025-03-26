import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 检查用户是否是管理员
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session?.user) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 检查用户角色
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/forum/new/:path*',
    '/forum/edit/:path*',
    '/wiki/edit/:path*',
  ],
}; 