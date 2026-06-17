"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  deleteServiceContractantTenderAvis,
  getTenderAvisErrorMessage,
  listServiceContractantTenderAvis,
  publishServiceContractantTenderAvisById,
  type TenderAvisItem,
  type TenderAvisStatus,
  type TenderAvisType,
} from "@/services/tendersAvis";

interface AvisListTabProps {
  locale: string;
  aoId: string;
  isRtl: boolean;
}

function getAvisTypeLabel(type: TenderAvisType) {
  switch (type) {
    case "ao":
      return "AO";
    case "attribution_provisoire":
      return "Attribution provisoire";
    case "attribution_definitive":
      return "Attribution definitive";
    case "annulation":
      return "Annulation";
    case "rectificatif":
      return "Rectificatif";
    default:
      return type;
  }
}

function getSupportLabel(item: TenderAvisItem) {
  if (item.publieBomop && item.publiePresse) {
    return "BOMOP + Presse";
  }
  if (item.publiePresse) {
    return "Presse";
  }
  if (item.publieBomop) {
    return "BOMOP";
  }

  switch (item.support) {
    case "bomop":
      return "BOMOP";
    case "presse":
      return "Presse";
    case "plateforme":
      return "Plateforme";
    default:
      return item.support;
  }
}

function getStatusLabel(status: TenderAvisStatus) {
  return status === "publie" ? "Publie" : "Brouillon";
}

function getStatusClass(status: TenderAvisStatus) {
  return status === "publie"
    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-700";
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

export default function AvisListTab({ locale, aoId, isRtl }: AvisListTabProps) {
  const router = useRouter();
  const [items, setItems] = useState<TenderAvisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recentlyPublishedId, setRecentlyPublishedId] = useState<string | null>(
    null,
  );

  const createHref = `/${locale}/dashboard/contractant/appels-offres/${aoId}/avis/create`;

  const loadAvis = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listServiceContractantTenderAvis(aoId);
      setItems(response);
    } catch (error) {
      setError(
        getTenderAvisErrorMessage(
          error,
          "Impossible de charger la liste des avis.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [aoId]);

  useEffect(() => {
    void loadAvis();
  }, [loadAvis]);

  const canPublishCount = useMemo(
    () => items.filter((item) => item.status === "brouillon").length,
    [items],
  );

  const handlePublish = async (id: string) => {
    try {
      setError(null);
      setPublishingId(id);
      const updated = await publishServiceContractantTenderAvisById(aoId, id);
      setItems((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
      setSuccessMessage("Avis publie avec succes.");
      setRecentlyPublishedId(id);
    } catch (error) {
      setError(
        getTenderAvisErrorMessage(
          error,
          "Publication de l'avis impossible pour le moment.",
        ),
      );
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Confirmer la suppression de cet avis ? Cette action est irreversible.",
    );
    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setDeletingId(id);
      await deleteServiceContractantTenderAvis(aoId, id);
      setItems((current) => current.filter((item) => item.id !== id));
      setSuccessMessage("Avis supprime avec succes.");
      router.refresh();
    } catch (error) {
      setError(
        getTenderAvisErrorMessage(
          error,
          "Suppression de l'avis impossible pour le moment.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage(null);
      setRecentlyPublishedId(null);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        Chargement des avis...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {successMessage}
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between",
          isRtl && "md:flex-row-reverse",
        )}
      >
        <p className="text-xs text-slate-600">
          {items.length} avis, dont {canPublishCount} en attente de publication.
        </p>
        <Link
          href={createHref}
          className="inline-flex h-8 items-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Creer avis
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
          Aucun avis cree pour cet AO.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Type
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Support
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Date publication
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Statut
                </TableHead>
                <TableHead
                  className={cn(
                    "h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                    isRtl ? "text-left" : "text-right",
                  )}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const viewHref = `/${locale}/dashboard/contractant/appels-offres/${aoId}/avis/${item.id}`;
                const editHref = `/${locale}/dashboard/contractant/appels-offres/${aoId}/avis/${item.id}/edit`;
                const isPublishing = publishingId === item.id;
                const isDeleting = deletingId === item.id;

                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "border-b border-slate-100 transition-colors",
                      recentlyPublishedId === item.id &&
                        "bg-emerald-50/70 hover:bg-emerald-50",
                    )}
                  >
                    <TableCell className="px-3 py-2.5 text-xs text-slate-700">
                      {getAvisTypeLabel(item.type)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-xs text-slate-700">
                      {getSupportLabel(item)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-xs text-slate-700">
                      {formatDate(item.publicationDate, locale)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-6 rounded-full px-2 text-[10px] font-semibold",
                          getStatusClass(item.status),
                        )}
                      >
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-3 py-2.5",
                        isRtl ? "text-left" : "text-right",
                      )}
                    >
                      <div
                        className={cn(
                          "flex flex-wrap items-center gap-1",
                          isRtl ? "justify-start" : "justify-end",
                        )}
                      >
                        <Link
                          href={viewHref}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3 w-3" />
                          Voir
                        </Link>
                        <Link
                          href={editHref}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-3 w-3" />
                          Modifier
                        </Link>
                        {/*<button
                          type="button"
                          disabled={item.status === "publie" || isPublishing}
                          onClick={() => {
                            void handlePublish(item.id);
                          }}
                          className="inline-flex h-7 items-center gap-1 rounded-md bg-[#4CAF50] px-2.5 text-[11px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isPublishing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Megaphone className="h-3 w-3" />
                          )}
                          {item.status === "publie"
                            ? "Publie"
                            : isPublishing
                              ? "Publication..."
                              : "Publier"}
                        </button>*/}
                        
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => {
                            void handleDelete(item.id);
                          }}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 text-[11px] font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Supprimer
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
