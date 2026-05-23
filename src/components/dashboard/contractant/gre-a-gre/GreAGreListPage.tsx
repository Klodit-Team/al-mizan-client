"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type {
  GreAGreRequestStatus,
  ServiceContractantGreAGreRequestItem,
} from "@/services/greAGre";
import GreAGreFilters from "./GreAGreFilters";
import GreAGreTable from "./GreAGreTable";

interface GreAGreListPageProps {
  locale: string;
  data: ServiceContractantGreAGreRequestItem[];
  isLoading: boolean;
  dict: any;
}

export default function GreAGreListPage({
  locale,
  data,
  isLoading,
  dict,
}: GreAGreListPageProps) {
  const router = useRouter();
  const isRtl = locale === "ar";
  const [statusFilter, setStatusFilter] = useState<
    "all" | GreAGreRequestStatus
  >("all");

  const filteredData = useMemo(() => {
    if (statusFilter === "all") {
      return data;
    }

    return data.filter((item) => item.status === statusFilter);
  }, [data, statusFilter]);

  return (
    <div className="space-y-3">
      <header
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between",
          isRtl && "md:flex-row-reverse",
        )}
      >
        <div>
          <h1 className="text-lg font-bold uppercase tracking-[0.03em] text-slate-900">
            {dict?.title || "Demandes Gre a Gre"}
          </h1>
          <p className="text-xs text-slate-500">
            {dict?.subtitle || "Suivi des demandes, analyse IA et decisions."}
          </p>
        </div>

        <Link
          href={`/${locale}/dashboard/contractant/gre-a-gre/new`}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <span className="text-base leading-none">+</span>
          {dict?.createBtn || "Nouvelle demande"}
        </Link>
      </header>

      <GreAGreFilters status={statusFilter} onStatusChange={setStatusFilter} dict={dict?.filters} />

      <GreAGreTable
        locale={locale}
        isRtl={isRtl}
        data={filteredData}
        isLoading={isLoading}
        dict={dict}
        onViewDetail={(id) => {
          router.push(`/${locale}/dashboard/contractant/gre-a-gre/${id}`);
        }}
      />
    </div>
  );
}
