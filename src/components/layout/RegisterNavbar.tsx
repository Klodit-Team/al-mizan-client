"use client";
import Image from "next/image";
import Link from "next/link";

import { type Locale } from "@/i18n/config";

import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface NavbarRegisterProps {
  dict: CommonDict["navbarRegister"];
  locale: Locale;
}
export default function NavbarRegister({ dict, locale }: NavbarRegisterProps) {
    return (
        <header className="w-full bg-white border-b-2 border-[#4CAF50]">
            <div className="mx-auto px-8 h-14 flex items-center justify-between">
                
                
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo2.png"
                        alt="Al-Mizan Logo"
                        width={100}
                        height={100}
                        unoptimized
                    />
                    
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/help"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        {dict.helpCenter}
                    </Link>
                    <Link
                        href="/support"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        {dict.contactSupport}
                    </Link>

                    
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </header>
    );
}