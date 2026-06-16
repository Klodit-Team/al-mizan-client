import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameIsMissingLocale = locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(
        `/${defaultLocale}${pathname === "/" ? "" : pathname}`,
        request.url
      )
    );
  }

  const token =
    request.cookies.get("access_token")?.value ||
    request.cookies.get("token")?.value;
  const userType = request.cookies.get("user_type")?.value;
  const isProtected = pathname.includes("/dashboard");

  if (isProtected && !token) {
    const locale = pathname.split("/")[1] || defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  if (isProtected && userType) {
    const locale = pathname.split("/")[1] || defaultLocale;
    const isAdminPath = pathname.includes("/dashboard/admin");
    const isContractantPath = pathname.includes("/dashboard/contractant");
    const isOperateurPath = pathname.includes("/dashboard/operateur");
    const isCommissionPath = pathname.includes("/dashboard/commission");

    if (userType === "admin" && !isAdminPath) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard/admin/tableau-de-bord`, request.url)
      );
    }

    if (userType === "contractant" && !isContractantPath) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard/contractant/tableau-de-bord`, request.url)
      );
    }

    if (userType === "operateur" && !isOperateurPath) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard/operateur/tableau-de-bord`, request.url)
      );
    }

    if (userType === "commission" && !isCommissionPath) {
      // Read the commission_user_id cookie set at login to build the correct URL.
      const commissionUserId = request.cookies.get("commission_user_id")?.value;
      const commissionRedirect = commissionUserId
        ? `/${locale}/dashboard/commission/${commissionUserId}/tableau-de-bord`
        : `/${locale}/dashboard/commission`;
      return NextResponse.redirect(new URL(commissionRedirect, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|.*\\.ico|.*\\.webp).*)",
  ],
};