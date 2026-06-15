"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Loader2, ScanLine } from "lucide-react";
import {
  getAdminPiecesForSoumission,
  getDocumentOcrResult,
  type AdminPiece,
  type DocumentOcrResult,
} from "@/services/document-ocr";

const PIECE_TYPE_LABELS: Record<string, string> = {
  NIF: "NIF",
  NIS: "NIS",
  REGISTRE_COMMERCE: "Registre de Commerce",
  CASIER_JUDICIAIRE: "Casier Judiciaire",
  CNAS: "Attestation CNAS",
  CASNOS: "Attestation CASNOS",
  ATTESTATION_FISCALE: "Attestation Fiscale",
  BILAN: "Bilan Financier",
  AUTRE: "Autre",
};

function fmtDateTime(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("fr-DZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PieceOcrRowProps {
  piece: AdminPiece;
}

function PieceOcrRow({ piece }: PieceOcrRowProps) {
  const [ocr, setOcr] = useState<DocumentOcrResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDocumentOcrResult(piece.documentId)
      .then((result) => { if (active) setOcr(result); })
      .catch(() => { if (active) setOcr(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [piece.documentId]);

  const typeLabel = PIECE_TYPE_LABELS[piece.type] ?? piece.type;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <ScanLine className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-800">{typeLabel}</span>
        {piece.designation && (
          <span className="text-[10px] text-slate-400">— {piece.designation}</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Chargement de l&apos;analyse OCR…
        </div>
      ) : !ocr || ocr.analysedAt === null ? (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          Analyse OCR en attente
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {ocr.isConforme === true && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle className="h-3 w-3" /> Conforme
              </span>
            )}
            {ocr.isConforme === false && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                <AlertTriangle className="h-3 w-3" /> Non conforme
              </span>
            )}
            {ocr.scoreConfiance !== null && (
              <span className="text-[10px] text-slate-500">
                Confiance : {Math.round(Number(ocr.scoreConfiance) * 100)}%
              </span>
            )}
            <span className="text-[10px] text-slate-400">
              Analysé le {fmtDateTime(ocr.analysedAt)}
            </span>
          </div>

          {Array.isArray(ocr.anomalies) && ocr.anomalies.length > 0 ? (
            <div className="space-y-1">
              {(ocr.anomalies as string[]).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700"
                >
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {typeof a === "string" ? a : JSON.stringify(a)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">Aucune anomalie détectée</p>
          )}
        </div>
      )}
    </div>
  );
}

interface OcrAnalysisSectionProps {
  soumissionId: string;
}

export default function OcrAnalysisSection({ soumissionId }: OcrAnalysisSectionProps) {
  const [pieces, setPieces] = useState<AdminPiece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdminPiecesForSoumission(soumissionId)
      .then((result) => { if (active) setPieces(result); })
      .catch(() => { if (active) setPieces([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [soumissionId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Analyse OCR — Pièces Administratives
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Chargement des pièces administratives…
        </div>
      </div>
    );
  }

  if (pieces.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Analyse OCR — Pièces Administratives
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          Aucune pièce administrative enregistrée
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Analyse OCR — Pièces Administratives
      </p>
      {pieces.map((piece) => (
        <PieceOcrRow key={piece.id} piece={piece} />
      ))}
    </div>
  );
}
