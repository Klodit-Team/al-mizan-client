"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import type { getDictionary } from "@/i18n/get-dictionaries";
import { logout } from "@/services/auth/api";
import { apiClient } from "@/services/client";
import { useAdminId } from "@/hooks/useAdminId";
import { useState, useEffect } from "react";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;
const localeLabels: Record<Locale, string> = {
  fr: "FR",
  ar: "AR",
  en: "EN",
};

interface NavbarProps {
  isLoggedIn?: boolean;
  userInitial?: string;
  userName?: string;
  userCompany?: string;
  userRole?: "ADMIN" | "CONTRACTANT" | "OPERATEUR" | "COMMISSION";
  adminId?: string;
  dict: CommonDict["navbar"];
  locale: Locale;
}

export default function Navbar({
  isLoggedIn = false,
  userInitial = "R",
  userName = "Ahmed Mansour",
  userCompany = "MANSOUR Administrateur",
  userRole = "ADMIN",
  adminId,
  dict,
  locale,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { adminId: storedAdminId } = useAdminId();
  const currentAdminId = adminId || storedAdminId || "id";
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      apiClient<{ count: number }>("/api/v1/notifications/non-lues/count")
        .then((res: any) => {
          let count = 0;
          if (res && typeof res.count === 'number') count = res.count;
          else if (res && res.data && typeof res.data.count === 'number') count = res.data.count;
          
          setUnreadCount(count);
        })
        .catch(() => {
          // Silent catch for notification count
        });
    }
  }, [isLoggedIn]);

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
  };

  const languageSelector = (
    <div className="flex overflow-hidden rounded-lg border border-gray-600">
      {locales.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => switchLocale(option)}
          className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            option === locale
              ? "bg-[#4CAF50] text-white"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
          aria-pressed={option === locale}
        >
          {localeLabels[option]}
        </button>
      ))}
    </div>
  );

  const navLinks = [
    { label: dict.links.home, href: `/${locale}` },
    { label: dict.links.tenders, href: `/${locale}/tenders` },
    { label: dict.links.statistics, href: `/${locale}/statistics` },
    { label: dict.links.legal, href: `/${locale}/legal` },
    { label: dict.links.contact, href: `/${locale}/contact` },
  ];

  const notificationsHref = (() => {
    switch (userRole) {
      case "ADMIN":        return `/${locale}/dashboard/admin/notif`;
      case "CONTRACTANT":  return `/${locale}/dashboard/contractant/notifications`;
      case "COMMISSION":   return `/${locale}/dashboard/commission`;
      default:             return `/${locale}/dashboard/operateur/notifications`;
    }
  })();

  const profileHref = (() => {
    switch (userRole) {
      case "ADMIN":        return `/${locale}/dashboard/admin/profile`;
      case "CONTRACTANT":  return `/${locale}/dashboard/contractant/profil`;
      case "COMMISSION":   return `/${locale}/dashboard/commission/profil`;
      default:             return `/${locale}/dashboard/operateur/profil`;
    }
  })();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    document.cookie = "user_type=; Path=/; Max-Age=0; SameSite=Lax";
    router.push(`/${locale}`);
  };

  if (isLoggedIn) {
    return (
      <nav
        className="w-full border-b border-gray-700 px-6 py-3 flex items-center justify-between"
        style={{ backgroundColor: "#1e2535" }}
      >
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Al-Mizan Logo"
            width={100}
            height={100}
            unoptimized
          />
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={dict.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-gray-300 placeholder:text-gray-500 outline-none border border-gray-600 focus:border-gray-400 transition-colors"
              style={{ backgroundColor: "#2a3347" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {languageSelector}

          {/* Notifications */}
          <button
            title="notifications"
            className="relative text-gray-400 hover:text-white transition-colors"
            onClick={() => router.push(notificationsHref)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "#4CAF50" }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            title={dict.logout}
            className="text-gray-400 hover:text-white transition-colors"
            onClick={handleLogout}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-600" />

          {/* Profile */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push(profileHref)}
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-white leading-tight">{userName}</p>
              <p className="text-xs text-gray-400 leading-tight">{userCompany}</p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: "#4CAF50" }}
            >
              {userInitial}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ── Logged out ──────────────────────────────────────────────────────────────
  return (
    <nav
      className="w-full border-b border-gray-700 px-6 py-3 flex items-center justify-between"
      style={{ backgroundColor: "#1e2535" }}
    >
      <Link href={`/${locale}`} className="flex items-center gap-2">
        <Image src="/logo.png" alt="Al-Mizan Logo" width={100} height={100} unoptimized />
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
    <Link
      key={link.label}
      href={`/${locale}/tenders`} 
      className="text-sm text-gray-300 hover:text-white transition-colors"
    >
      {link.label}
    </Link>
  ))}
      </div>

      <div className="flex items-center gap-3">
        {languageSelector}
        <Link
          href={`/${locale}/auth/login`}
          className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: "#4CAF50" }}
        >
          {dict.signIn}
        </Link>
      </div>
    </nav>
  );
}
