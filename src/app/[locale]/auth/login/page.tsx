import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/forms/LoginForm";
import Image from "next/image";
import { getAuthDictionary } from "@/i18n/get-dictionaries";
import type { Locale } from "@/i18n/config";
interface LoginPageProps {
 params: Promise<{ locale: Locale }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
    const { locale } = await params;
    const dict = await getAuthDictionary(locale);
    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            <main className="flex-1 flex flex-col lg:flex-row items-stretch overflow-hidden">
                <div className="hidden lg:flex lg:w-[65%] h-full">
                    <Image
                        src="/leftpannel.png"
                        alt="Login Illustration"
                        width={1040}
                        height={1040}
                        unoptimized
                    />
                </div>

                <div className="w-full flex items-center justify-center py-6 bg-white overflow-y-auto">
                    <div className="w-full max-w-md px-8">
                        <LoginForm dict={dict.login} />
                    </div>
                </div>
            </main>
        </div>
    );
}