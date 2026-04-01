import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import { locales, getLocaleDirection, type Locale } from "@/i18n/config";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const direction = getLocaleDirection(locale as Locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={`${montserrat.variable} antialiased`}>{children}</body>
    </html>
  );
}
