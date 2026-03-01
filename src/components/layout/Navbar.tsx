"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

interface NavbarProps {
    isLoggedIn?: boolean;
    userInitial?: string;
}

export default function Navbar({ isLoggedIn = false, userInitial = "R" }: NavbarProps) {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const locale = (params?.locale as Locale) || "fr";

    const toggleLang = () => {
        const nextLocale = locale === "fr" ? "ar" : "fr";
        // Construct new path by replacing the locale segment
        const segments = pathname.split("/");
        segments[1] = nextLocale;
        router.push(segments.join("/"));
    };

    // ─── LOGGED IN NAVBAR ───────────────────────────────────────────────
    if (isLoggedIn) {
        return (
            <nav className="w-full bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">

                <Link href={`/${locale}`} className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Al-Mizan Logo" width={40} height={40} unoptimized />
                    
                </Link>


                <div className="flex items-center gap-6">
                    <Link href="/help" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                        Help Center
                    </Link>
                    <Link href="/support" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                        Contact Support
                    </Link>

                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer"
                        style={{ backgroundColor: "#4CAF50" }}
                    >
                        {userInitial}
                    </div>
                </div>
            </nav>
        );
    }

    // ─── LANDING PAGE NAVBAR (logged out) ───────────────────────────────
    return (
        <nav className="w-full px-8 py-3 flex items-center justify-between" style={{ backgroundColor: "#1e2535" }}>
            
            <Link href={`/${locale}`} className="flex items-center gap-2">
                <Image src="/logo.png" alt="Al-Mizan Logo" width={100} height={100} unoptimized />               
            </Link>


            <div className="hidden md:flex items-center gap-8">
                {["Home", "Tenders", "Statistics", "Legal", "Contact"].map((item) => (
                    <Link
                        key={item}
                        href={`/${locale}/${item.toLowerCase()}`}
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        {item}
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
                    Sign In
                </Link>
            </div>
        </nav>
    );
}