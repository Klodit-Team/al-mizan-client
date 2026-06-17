"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { deleteServiceContractantTenderAvis } from "@/services/tendersAvis";

interface AvisDetailActionsProps {
  locale: string;
  aoId: string;
  avisId: string;
  backHref: string;
  canEdit: boolean;
}

export default function AvisDetailActions({
  locale,
  aoId,
  avisId,
  backHref,
  canEdit,
}: AvisDetailActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editHref = `/${locale}/dashboard/contractant/appels-offres/${aoId}/avis/${avisId}/edit`;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Confirmer la suppression de cet avis ? Cette action est irreversible.",
    );
    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await deleteServiceContractantTenderAvis(aoId, avisId);
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Impossible de supprimer cet avis pour le moment.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={backHref}
          className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Retour a la liste des avis
        </Link>

        {canEdit ? (
          <Link
            href={editHref}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </Link>
        ) : null}

        <button
          type="button"
          disabled={isDeleting}
          onClick={() => {
            void handleDelete();
          }}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {isDeleting ? "Suppression..." : "Supprimer"}
        </button>
      </div>
    </div>
  );
}
