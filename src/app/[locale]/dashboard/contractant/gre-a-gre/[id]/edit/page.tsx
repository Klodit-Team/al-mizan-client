import Link from "next/link";
import { notFound } from "next/navigation";

import GreAGreRequestForm from "@/components/dashboard/contractant/gre-a-gre/GreAGreRequestForm";
import { getServiceContractantGreAGreRequestById } from "@/services/greAGre";

interface EditGreAGreRequestPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditGreAGreRequestPage({
  params,
}: EditGreAGreRequestPageProps) {
  const { locale, id } = await params;
  const item = await getServiceContractantGreAGreRequestById(id);

  if (!item) {
    notFound();
  }

  const listHref = `/${locale}/dashboard/contractant/gre-a-gre`;
  const detailHref = `/${locale}/dashboard/contractant/gre-a-gre/${id}`;

  return (
    <main className="space-y-5 overflow-auto p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Modifier et resoumettre
            </h1>
            <p className="text-xs text-slate-500">
              Reference: {item.reference}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={detailHref}
              className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retour au detail
            </Link>
            <Link
              href={listHref}
              className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retour a la liste
            </Link>
          </div>
        </header>
      </section>

      <GreAGreRequestForm
        locale={locale}
        mode="resubmit"
        requestId={id}
        initialData={item}
      />
    </main>
  );
}
