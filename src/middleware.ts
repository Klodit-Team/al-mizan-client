import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the pathname is missing a locale
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        // For now, just redirect to default locale
        // In a more complex setup, you might check Headers (Accept-Language)
        return NextResponse.redirect(
            new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
