import RegistrationSuccess from "@/components/forms/RegistrationSuccess";
import { type Locale } from "@/i18n/config";
import RegisterNavbar from "@/components/layout/RegisterNavbar";
import { getAuthDictionary, getDictionary } from "@/i18n/get-dictionaries";

interface SuccessPageProps {
    params: Promise<{ locale: Locale }>;
    searchParams: Promise<{ id?: string; hash?: string }>;
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
    const { locale } = await params;
    const dict = await getAuthDictionary(locale);
    const dictCommon = await getDictionary(locale);
    const { id, hash } = await searchParams;

    return (
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
            <RegisterNavbar dict={dictCommon.navbarRegister} locale={locale} />
            <main className="flex-1 w-full max-w-2xl mx-auto py-16 px-4">
                <RegistrationSuccess
                    locale={locale}
                    registrationId={id}
                    receiptHash={hash}
                    dict={dict.registerSuccess}
                />
            </main>
        </div>
    );
}