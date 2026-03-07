import { type Locale } from "@/i18n/config";
import type { getDictionary } from "@/i18n/get-dictionaries";
import Image from "next/image";
import Link from "next/link";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;
interface LoginLeftPanelProps {
    dict: CommonDict["loginPanel"];
    locale: Locale;
}

export default function LoginLeftPanel({ dict, locale }: LoginLeftPanelProps) {
    return (
        <div
            className="hidden lg:flex lg:w-[65%] h-full flex-col justify-between px-24 py-12 relative overflow-hidden"
            style={{ backgroundColor: "#364150" }}
        >
            

            {/* Logo */}
            <div className="relative z-10 p-4">
                <div className="flex items-center gap-3 mb-1">
                    <Link href={`/${locale}`} className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Al-Mizan Logo" width={150} height={150} unoptimized />
                    </Link>
                </div>
                <p className="text-xs font-semibold  uppercase" style={{ color: "#73c575ff" }}>{dict.sovereignProcurement}</p>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h1 className="text-4xl font-semibold text-white leading-tight mb-6">
                    {dict.title}<br />
                </h1>
                <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                    {dict.subtitle}
                </p>

                {/* Feature badges */}
                <div className="mt-10 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: "rgba(76, 175, 80, 0.15)", border: "1px solid rgba(76, 175, 80, 0.3)" }}>
                            <svg className="w-4 h-4" style={{ color: "#4CAF50" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-300">{dict.securedBy}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: "rgba(76, 175, 80, 0.15)", border: "1px solid rgba(76, 175, 80, 0.3)" }}>
                            <svg className="w-4 h-4" style={{ color: "#4CAF50" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-300">{dict.realTime}</span>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="relative z-10">
                <p className="text-xs text-gray-400 uppercase tracking-widest">{dict.ministere}</p>
            </div>
        </div>
    );
}