"use client";

import { Loader2, FileSearch } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AoTableRowActions from "./AoTableRowActions";
import type { ServiceContractantTenderItem } from "@/services/dashboard";

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

interface TendersFiltersDict {
  status?: string;
  all?: string;
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

interface TendersListDict {
  table: TendersTableDict;
  actions: TendersActionsDict;
  filters: TendersFiltersDict;
  types: TendersTypeDict;
  empty: string;
  loading?: string;
}

interface AoTableProps {
  data: ServiceContractantTenderItem[];
  dict: TendersListDict;
  locale: string;
  isRtl: boolean;
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onChangeStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

function getTypeLabel(
  type: ServiceContractantTenderItem["type"],
  dict: TendersTypeDict,
) {
  switch (type) {
    case "ouvert":
      return dict.open;
    case "restreint":
      return dict.restricted;
    case "gre_a_gre":
      return dict.direct;
    default:
      return type;
  }
}

function getStatusLabel(
  status: ServiceContractantTenderItem["status"],
  dict: TendersFiltersDict,
) {
  switch (status) {
    case "brouillon":
      return dict.draft;
    case "publie":
      return dict.published;
    case "en_cours":
      return dict.ongoing;
    case "evaluation":
      return dict.evaluation;
    case "attribue":
      return dict.awarded;
    case "annule":
      return dict.cancelled;
    default:
      return status;
  }
}

function getStatusBadgeClass(status: ServiceContractantTenderItem["status"]) {
  switch (status) {
    case "brouillon":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "publie":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "en_cours":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "evaluation":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "attribue":
      return "border-green-200 bg-green-100 text-green-700";
    case "annule":
      return "border-red-200 bg-red-100 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function formatDate(dateValue: string, locale: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

export default function AoTable({
  data,
  dict,
  locale,
  isRtl,
  isLoading,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}: AoTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        </div>
        <p className="text-xs text-slate-600">{dict.loading || "Loading..."}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <FileSearch className="h-5 w-5 text-slate-500" />
        </div>
        <p className="text-xs text-slate-600">{dict.empty}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead
              className={cn(
                "h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                isRtl ? "text-right" : "text-left",
              )}
            >
              {dict.table.reference}
            </TableHead>
            <TableHead
              className={cn(
                "h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                isRtl ? "text-right" : "text-left",
              )}
            >
              {dict.table.object}
            </TableHead>
            <TableHead
              className={cn(
                "h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                isRtl ? "text-right" : "text-left",
              )}
            >
              {dict.table.type}
            </TableHead>
            <TableHead
              className={cn(
                "h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                isRtl ? "text-right" : "text-left",
              )}
            >
              {dict.table.deadline}
            </TableHead>
            <TableHead
              className={cn(
                "h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                isRtl ? "text-right" : "text-left",
              )}
            >
              {dict.table.status}
            </TableHead>
            <TableHead
              className={cn(
                "h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                isRtl ? "text-left" : "text-right",
              )}
            >
              {dict.table.actions}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.id}
              className="border-b border-slate-100 hover:bg-slate-50/70"
            >
              <TableCell className="px-4 py-3 text-xs font-semibold text-[#4CAF50]">
                {row.reference}
              </TableCell>
              <TableCell className="max-w-[360px] px-4 py-3 text-xs text-slate-700">
                {row.object}
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                {getTypeLabel(row.type, dict.types)}
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                {formatDate(row.deadline, locale)}
              </TableCell>
              <TableCell className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 rounded-full px-2 text-[10px] font-semibold capitalize",
                    getStatusBadgeClass(row.status),
                  )}
                >
                  {getStatusLabel(row.status, dict.filters)}
                </Badge>
              </TableCell>
              <TableCell
                className={cn("px-4 py-3", isRtl ? "text-left" : "text-right")}
              >
                <AoTableRowActions
                  id={row.id}
                  status={row.status}
                  onView={onView}
                  onEdit={onEdit}
                  onChangeStatus={onChangeStatus}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
