"use client";

import { Eye, PencilLine, RefreshCw, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface AoTableRowActionsProps {
  id: string;
  status: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onChangeStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AoTableRowActions({
  id,
  status,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}: AoTableRowActionsProps) {
  const isDraft = status === "brouillon";
  const canChangeStatus = status === "publie" || status === "en_cours";

  return (
    <div className="flex items-center justify-end gap-3 text-slate-500">
      <button
        type="button"
        className="transition-colors hover:text-slate-800"
        onClick={() => onView(id)}
        aria-label="View"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>

      {isDraft && (
        <button
          type="button"
          className="transition-colors hover:text-slate-800"
          onClick={() => onEdit(id)}
          aria-label="Edit"
        >
          <PencilLine className="h-3.5 w-3.5" />
        </button>
      )}

      {canChangeStatus && (
        <button
          type="button"
          className="transition-colors hover:text-slate-800"
          onClick={() => onChangeStatus(id)}
          aria-label="Change status"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      )}

      {isDraft && (
        <button
          type="button"
          className={cn("transition-colors hover:text-red-600")}
          onClick={() => onDelete(id)}
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
