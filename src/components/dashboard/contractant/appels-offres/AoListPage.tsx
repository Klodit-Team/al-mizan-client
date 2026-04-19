"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import AoFilters, { type AoFiltersState } from "./AoFilters";
import AoTable from "./AoTable";
import type { ServiceContractantTenderItem } from "@/services/dashboard";

interface TendersFiltersDict {
  status: string;
  all: string;
  draft: string;
  published: string;
  ongoing: string;
  evaluation: string;
  awarded: string;
  cancelled: string;
  dateStart?: string;
  dateEnd?: string;
  reset?: string;
}

interface TendersTableDict {
  reference: string;
  object: string;
  type: string;
  deadline: string;
  status: string;
  actions: string;
}

interface TendersActionsDict {
  view: string;
  edit: string;
  changeStatus: string;
  delete: string;
}

interface TendersTypeDict {
  open: string;
  restricted: string;
  direct: string;
}

interface TendersListDict {
  title: string;
  createBtn: string;
  searchPlaceholder: string;
  filters: TendersFiltersDict;
  table: TendersTableDict;
  actions: TendersActionsDict;
  empty: string;
  types: TendersTypeDict;
}

interface AoListPageProps {
  locale: string;
  dict: TendersListDict;
  data: ServiceContractantTenderItem[];
  isLoading: boolean;
  onChangeStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AoListPage({
  locale,
  dict,
  data,
  isLoading,
  onChangeStatus,
  onDelete,
}: AoListPageProps) {
  const router = useRouter();
  const isRtl = locale === "ar";
  const itemsPerPage = 8;
  const [filters, setFilters] = useState<AoFiltersState>({
    keyword: "",
    status: "all",
    dateStart: "",
    dateEnd: "",
  });
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.status !== "all" && item.status !== filters.status) {
        return false;
      }

      if (filters.keyword.trim()) {
        const normalizedKeyword = filters.keyword.trim().toLowerCase();
        const inReference = item.reference
          .toLowerCase()
          .includes(normalizedKeyword);
        const inObject = item.object.toLowerCase().includes(normalizedKeyword);

        if (!inReference && !inObject) {
          return false;
        }
      }

      if (filters.dateStart && item.deadline < filters.dateStart) {
        return false;
      }

      if (filters.dateEnd && item.deadline > filters.dateEnd) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page]);

  const handleFilterChange = (key: keyof AoFiltersState, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleView = (id: string) => {
    router.push(`/${locale}/dashboard/contractant/appels-offres/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/${locale}/dashboard/contractant/appels-offres/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Supprimer cet appel d'offres ?")) {
      onDelete(id);
    }
  };

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
            {dict.title}
          </h1>
        </div>

        <Link
          href={`/${locale}/dashboard/contractant/appels-offres/creation`}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <span className="text-base leading-none">+</span>
          {dict.createBtn}
        </Link>
      </header>

      <AoFilters
        dict={dict}
        isRtl={isRtl}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <AoTable
        data={paginatedData}
        dict={dict}
        locale={locale}
        isRtl={isRtl}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onChangeStatus={onChangeStatus}
        onDelete={handleDelete}
      />

      {!isLoading && filteredData.length > 0 && (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm md:flex-row md:items-center md:justify-between",
            isRtl && "md:flex-row-reverse",
          )}
        >
          <p>
            Showing {(page - 1) * itemsPerPage + 1} to{" "}
            {Math.min(page * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </p>

          <div
            className={cn(
              "flex items-center gap-2",
              isRtl && "flex-row-reverse",
            )}
          >
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="h-7 rounded border border-slate-200 px-2 text-[11px] font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="rounded border border-[#4CAF50] bg-[#4CAF50] px-2 py-1 text-[11px] font-semibold text-white">
              {page}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="h-7 rounded border border-slate-200 px-2 text-[11px] font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
