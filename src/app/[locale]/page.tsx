"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import { type Locale } from "@/i18n/config";

export default function Home() {
    const params = useParams();
    const locale = (params?.locale as Locale) || "fr";
    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-black sm:items-start max-w-6xl mx-auto w-full">
                <div className="w-full flex flex-col items-center sm:items-start">
                    <Image
                        className="dark:invert mb-8"
                        src="/next.svg"
                        alt="Next.js logo"
                        width={100}
                        height={20}
                        priority
                    />
                    <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
                        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-zinc-50">
                            Plateforme nationale souveraine <br />
                            <span style={{ color: "#4CAF50" }}>Al-Mizan</span>
                        </h1>
                        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                            La solution digitale complète pour la dématérialisation des marchés publics en Algérie.
                            Accédez aux appels d'offres, suivez les statistiques sectorielles et gérez vos contrats en toute transparence.
                        </p>
                    </div>
                    <div className="mt-10 flex flex-col gap-4 text-base font-medium sm:flex-row">
                        <a
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-white px-8 transition-opacity hover:opacity-90 md:w-auto"
                            style={{ backgroundColor: "#4CAF50" }}
                            href={`/${locale}/auth/register`}
                        >
                            Get Started →
                        </a>
                        <a
                            className="flex h-12 w-full items-center justify-center rounded-xl border border-solid border-gray-200 px-8 transition-colors hover:bg-gray-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-auto text-gray-700"
                            href={`/${locale}/tenders`}
                        >
                            Consult Tenders
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
