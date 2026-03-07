import { getAuthDictionary,getDictionary} from "@/i18n/get-dictionaries";
import type { Locale } from "@/i18n/config";
import AccountLockForm from "@/components/forms/AccountLockForm";
interface LoginPageProps {
 params: Promise<{ locale: Locale }>;
}

export default async function AccountLockPage({ params }: LoginPageProps) {
    const { locale } = await params;
    const dict = await getAuthDictionary(locale);
    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            <main className="flex-1 flex flex-col lg:flex-row items-stretch overflow-hidden">
               
                <div className="w-full flex items-center justify-center py-6 bg-white overflow-y-auto">
                    <div className="w-full max-w-md px-8">
                        <AccountLockForm dict={dict.accountLocked} />
                    </div>
                </div>
            </main>
        </div>
    );
}