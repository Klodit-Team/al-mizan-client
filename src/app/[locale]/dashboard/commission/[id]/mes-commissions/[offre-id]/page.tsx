import OffreDechiffrementPage from "@/components/dashboard/commission/ouverture/OffreDechiffrementPage";
import { type Locale } from "@/i18n/config";

export default async function Page({
    params,
}: {
    params: Promise<{ locale: Locale; id: string; "offre-id": string }>;
}) {
    const { locale, id, "offre-id": offreId } = await params;
    
    return <OffreDechiffrementPage locale={locale} offreId={offreId} />;
}
