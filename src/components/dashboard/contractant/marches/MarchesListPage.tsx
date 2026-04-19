"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { ServiceContractantMarcheListItem } from "@/services/tenderMarches";
import MarchesFilters, { type MarchesFiltersState } from "./MarchesFilters";
import MarchesTable from "./MarchesTable";

interface MarchesListPageProps {
  locale: string;
  data: ServiceContractantMarcheListItem[];
  isLoading: boolean;
}

const INITIAL_FILTERS: MarchesFiltersState = {
  status: "all",
  keyword: "",
  dateStart: "",
  dateEnd: "",
};

export default function MarchesListPage({
  locale,
  data,
  isLoading,
}: MarchesListPageProps) {
  const isRtl = locale === "ar";
  const itemsPerPage = 8;

  const [filters, setFilters] = useState<MarchesFiltersState>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    return data.filter((item) => {
      if (filters.status !== "all" && item.status !== filters.status) {
        return false;
      }

      if (filters.keyword.trim()) {
        const keyword = filters.keyword.trim().toLowerCase();
        const hasMatch =
          item.reference.toLowerCase().includes(keyword) ||
          item.object.toLowerCase().includes(keyword) ||
          item.economicOperatorName.toLowerCase().includes(keyword);

        if (!hasMatch) {
          return false;
        }
      }

      if (filters.dateStart && item.signatureDate < filters.dateStart) {
        return false;
      }

      if (filters.dateEnd && item.signatureDate > filters.dateEnd) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, page]);

  const handleFilterChange = (
    key: keyof MarchesFiltersState,
    value: string,
  ) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleResetFilters = () => {
    setPage(1);
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="space-y-3">
      <header
        className={cn(
          "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
          isRtl && "text-right",
        )}
      >
        <h1 className="text-lg font-bold uppercase tracking-[0.03em] text-slate-900">
          Marches List
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Suivi des marches signes avec consultation par statut et periode.
        </p>
      </header>

      <MarchesFilters
        isRtl={isRtl}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <MarchesTable
        locale={locale}
        isRtl={isRtl}
        rows={paginatedRows}
        isLoading={isLoading}
      />

      {!isLoading && filteredRows.length > 0 && (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm md:flex-row md:items-center md:justify-between",
            isRtl && "md:flex-row-reverse",
          )}
        >
          <p>
            Showing {(page - 1) * itemsPerPage + 1} to{" "}
            {Math.min(page * itemsPerPage, filteredRows.length)} of{" "}
            {filteredRows.length} entries
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
