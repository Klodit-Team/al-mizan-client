import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
        return NextResponse.redirect(
            new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
        );
    }

    const token = request.cookies.get("token")?.value;
    const isProtected = pathname.includes("/dashboard");

    if (isProtected && !token) {
        const locale = pathname.split("/")[1] || defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|.*\\.ico|.*\\.webp).*)'],
};