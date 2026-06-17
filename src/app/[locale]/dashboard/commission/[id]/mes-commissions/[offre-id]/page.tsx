import OffreDechiffrementPage from "@/components/dashboard/commission/ouverture/OffreDechiffrementPage";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

export default async function Page({
    params,
}: {
    params: Promise<{ locale: Locale; id: string; "offre-id": string }>;
}) {
    const { locale, "offre-id": offreId } = await params;
    const dict = await getDictionary(locale);
    const pageDict = dict.dashboard.commission.ouverturePage;

    return (
        <OffreDechiffrementPage
            locale={locale}
            offreId={offreId}
            dict={pageDict}
        />
    );
}
