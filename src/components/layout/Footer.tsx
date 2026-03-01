"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type Locale } from "@/i18n/config";

export default function Footer() {
    const params = useParams();
    const locale = (params?.locale as Locale) || "fr";
    const [email, setEmail] = useState("");

    const handleSubscribe = () => {
        if (!email) return;
        console.log("Subscribed:", email);
        setEmail("");
    };

    return (
        <footer style={{ backgroundColor: "#1e2535" }} className="text-gray-300">
            {/* Main footer content */}
            <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

                {/* Brand */}
                <div className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-3 9 3M3 6v12l9 3 9-3V6M12 3v18" />
                        </svg>
                        <span className="font-bold text-white text-sm tracking-widest uppercase">Al-Mizan</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Plateforme nationale souveraine dédiée à la dématérialisation et à la gestion des marchés publics.
                    </p>
                    <button className="mt-5 text-xs border border-gray-500 text-gray-300 hover:text-white hover:border-gray-300 transition-colors px-4 py-2 rounded-lg">
                        Member of ANEP
                    </button>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4" style={{ color: "#4CAF50" }}>
                        Quick Links
                    </h3>
                    <ul className="space-y-2.5">
                        {["Tenders Search", "Awarded Contracts", "Sector Statistics", "Operator Directory"].map((item) => (
                            <li key={item}>
                                <Link href={`/${locale}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Legal & Support */}
                <div>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "#4CAF50" }}>
                        Legal & Support
                    </h3>
                    <ul className="space-y-2.5">
                        {["Privacy Policy", "Terms of Service", "Technical Helpdesk", "Legislative Texts"].map((item) => (
                            <li key={item}>
                                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: "#4CAF50" }}>
                        Newsletter
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                        Stay updated with the latest tender alerts and regulatory changes.
                    </p>
                    <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-gray-600 focus-within:border-[#4CAF50] transition-colors">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none"
                            onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                        />
                        <button
                            onClick={handleSubscribe}
                            className="px-3 py-2.5 transition-all hover:opacity-90"
                            style={{ backgroundColor: "#4CAF50" }}
                        >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-700">
                <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        © 2024 Al-Mizan. Tous droits réservés. République Algérienne Démocratique et Populaire.
                    </p>
                    <div className="flex items-center gap-3">
                        {/* Globe icon */}
                        <button className="text-gray-500 hover:text-gray-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                            </svg>
                        </button>
                        {/* Location icon */}
                        <button className="text-gray-500 hover:text-gray-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}