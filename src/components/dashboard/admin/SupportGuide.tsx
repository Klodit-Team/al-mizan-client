"use client";
import Link from "next/link";
import { type Locale } from "@/i18n/config";

import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;



interface SupportGuideProps {
    locale: Locale;
    dict:CommonDict['dashboard']['admin']['support'];
}

export default function SupportGuide({ locale,dict }: SupportGuideProps) {
    const links = [
        {
            label: "Guide des procédures 2024",
            href: `/${locale}/dashboard/contractant/guide`,
            icon: (
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
        },
        {
            label: "Contacter le support technique",
            href: `/${locale}/support`,
            icon: (
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#1e2535", borderColor: "#2a3347" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "#2a3347" }}>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{dict.title}</span>
            </div>
            <div className="p-3 space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        {link.icon}
                        <span className="text-xs text-gray-300 hover:text-white transition-colors">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}