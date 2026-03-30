import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VerifyForm from "@/components/forms/VerifyForm";
import { getAuthDictionary, getDictionary } from "@/i18n/get-dictionaries";
import type { Locale } from "@/i18n/config";

interface VerifyPageProps {
    params: Promise<{ locale: Locale }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
    const { locale } = await params;
    const dict = await getAuthDictionary(locale);
    const commonDict = await getDictionary(locale);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar dict={commonDict.navbar} locale={locale} />
            <main className="flex-1">
                <VerifyForm dict={dict.verify} />
            </main>
            <Footer dict={commonDict.footer} locale={locale} />
        </div>
    );
}
