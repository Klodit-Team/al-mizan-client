import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function TendersLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans">
      <Navbar dict={dict.navbar} locale={locale as Locale} />
      <main className="flex-1">
        {children}
      </main>
      <Footer dict={dict.footer} locale={locale as Locale} />
    </div>
  );
}