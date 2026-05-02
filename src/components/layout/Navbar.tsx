"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import type { getDictionary } from "@/i18n/get-dictionaries";
import { logout } from "@/services/auth/api";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface NavbarProps {
    isLoggedIn?: boolean;
    userInitial?: string;
    userName?: string;
    userCompany?: string;
    userRole?: string;
    adminId?: string;
    dict: CommonDict["navbar"];
    locale: Locale;
}

export default function Navbar({ isLoggedIn = false, userInitial = "R", userName = "Ahmed Mansour", userCompany = "MANSOUR Administrateur", userRole = "ADMIN", adminId, dict, locale }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams<{ adminId?: string | string[] }>();
    const routeAdminId = Array.isArray(params.adminId) ? params.adminId[0] : params.adminId;
    const currentAdminId = adminId || routeAdminId || "admin";

    const toggleLang = () => {
        const nextLocale = locale === "fr" ? "ar" : "fr";
        const segments = pathname.split("/");
        segments[1] = nextLocale;
        window.location.href = segments.join("/");
    };

    const navLinks = [
        { label: dict.links.home, href: `/${locale}` },
        { label: dict.links.tenders, href: `/${locale}/tenders` },
        { label: dict.links.statistics, href: `/${locale}/statistics` },
        { label: dict.links.legal, href: `/${locale}/legal` },
        { label: dict.links.contact, href: `/${locale}/contact` },
    ];

    if (isLoggedIn) {
        return (
            <nav className="w-full border-b border-gray-700 px-6 py-3 flex items-center justify-between" style={{ backgroundColor: "#1e2535" }}>
            
                <Link href={`/${locale}`} className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Al-Mizan Logo" width={100} height={100} unoptimized />
                </Link>

                
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

            
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLang}
                        className="text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg px-3 py-1.5 transition-colors hover:border-gray-400"
                    >
                        {locale === "fr" ? "FR / AR" : "AR / FR"}
                    </button>
                
                    <button 
                        
                        title="notifications"
                        className="relative text-gray-400 hover:text-white transition-colors" onClick={()=>{
                            if(userRole === "ADMIN"){
                                router.push(`/${locale}/dashboard/admin/${currentAdminId}/notif`);

                            }else{
                                router.push(`/${locale}/dashboard/operateur/notifications`)
                            }
                    }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: "#4CAF50" }}>
                            !
                        </span>
                    </button>
                    <button

                        title={dict.logout}
                        className="relative text-gray-400 hover:text-white transition-colors"
                        onClick={async () => {
                            try {
                                await logout();
                            } catch {}
                            document.cookie = "user_type=; Path=/; Max-Age=0; SameSite=Lax";
                            router.push(`/${locale}`);
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        
                    </button>
                
                    <div className="w-px h-6 bg-gray-600" />

                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                        switch(userRole){
                            case "ADMIN": router.push(`/${locale}/dashboard/admin/${currentAdminId}/profile`); break;
                            case "OPERATEUR": router.push(`/${locale}/dashboard/operateur/profil`); break;
                            case  "COMMISSION": router.push(`/${locale}/dashboard/commission/profil`); break;
                        }
                    }}>
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

    return (
        <nav className="w-full px-8 py-3 flex items-center justify-between" style={{ backgroundColor: "#1e2535" }}>
            <Link href={`/${locale}`} className="flex items-center gap-2">
                <Image src="/logo.png" alt="Al-Mizan Logo" width={100} height={100} unoptimized />
            </Link>

            <div className="hidden md:flex items-center gap-8">
                {navLinks.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={toggleLang}
                    className="text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg px-3 py-1.5 transition-colors hover:border-gray-400"
                >
                    {locale === "fr" ? "FR / AR" : "AR / FR"}
                </button>
                <Link
                    href={`/${locale}/auth/login`}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: "#4CAF50" }}
                >
                    {dict.signIn}
                </Link>
            </div>
        </nav>
    );
}
