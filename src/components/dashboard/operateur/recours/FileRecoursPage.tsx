"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  useCreateOperateurRecoursMutation,
  useRecoursCreationOptionsQuery,
} from "@/services/operateur-recours/queries";
import {
  ArrowLeft,
  Clock,
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Send,
  Building2,
  CalendarDays,
  DollarSign,
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
}

function daysRemaining(dateStr: string): number {
  if (!dateStr) {
    return 0;
  }
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function fmt(iso: string, locale: string = "fr") {
  if (!iso) {
    return "-";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function normalizeIdForCompare(value: string): string {
  return value.trim().toLowerCase();
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-800">{value || "-"}</p>
      </div>
    </div>
  );
}

export default function FileRecoursPage({ dict, locale }: { dict: any; locale: Locale }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const createMutation = useCreateOperateurRecoursMutation();
  const { data: creationOptions, isLoading: isLoadingOptions, isError: isOptionsError } = useRecoursCreationOptionsQuery();

  const aoIdFromQuery = searchParams.get("aoId") || "";
  const attributionIdFromQuery = searchParams.get("attributionId") || "";
  const aoReferenceFromQuery = searchParams.get("ao") || "";
  const aoObjectFromQuery = searchParams.get("objet") || "";
  const dateFinRecoursFromQuery = searchParams.get("dateFinRecours") || "";
  const winnerFromQuery = searchParams.get("winner") || "";
  const montantFromQuery = searchParams.get("montant") || "";
  const dateAttributionFromQuery = searchParams.get("dateAttribution") || "";

  const [motif, setMotif] = useState("");
  const [aoId, setAoId] = useState(aoIdFromQuery);
  const [attributionId, setAttributionId] = useState(attributionIdFromQuery);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submittedRecoursId, setSubmittedRecoursId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const aos = creationOptions?.aos || [];
  const attributions = creationOptions?.attributions || [];

  const aoSelection = useMemo(() => {
    return aos.find((item) => item.id === aoId) || null;
  }, [aos, aoId]);

  const availableAttributions = useMemo(() => {
    if (!aoId) {
      return attributions;
    }
    const normalizedAoId = normalizeIdForCompare(aoId);
    return attributions.filter((item) => normalizeIdForCompare(item.aoId) === normalizedAoId);
  }, [aoId, attributions]);

  const selectedAttribution = useMemo(() => {
    return attributions.find((item) => item.id === attributionId) || null;
  }, [attributions, attributionId]);

  const effectiveRecoursEndDate = selectedAttribution?.dateFinRecours || dateFinRecoursFromQuery;
  const days = useMemo(() => daysRemaining(effectiveRecoursEndDate), [effectiveRecoursEndDate]);
  const isExpired = Boolean(effectiveRecoursEndDate) && days <= 0;

  useEffect(() => {
    if (!availableAttributions.length) {
      if (attributionId) {
        setAttributionId("");
      }
      return;
    }

    const exists = availableAttributions.some((item) => item.id === attributionId);
    if (!exists) {
      setAttributionId(availableAttributions[0].id);
    }
  }, [availableAttributions, attributionId]);

  useEffect(() => {
    if (!aos.length) {
      return;
    }

    const exists = aos.some((item) => item.id === aoId);
    if (!exists) {
      setAoId(aos[0].id);
    }
  }, [aos, aoId]);

  const motifValid = motif.trim().length >= 50;
  const idsValid = Boolean(aoId) && Boolean(attributionId);
  const canSubmit = motifValid && idsValid && !isExpired;

  function addFile(file: File) {
    const size = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / 1024 / 1024).toFixed(1)} MB`;

    setFiles((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: file.name,
        size,
      },
    ]);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    Array.from(event.dataTransfer.files).forEach(addFile);
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      Array.from(event.target.files).forEach(addFile);
    }
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    const created = await createMutation.mutateAsync({
      appelOffreId: aoId.trim(),
      attributionProvisoireId: attributionId.trim(),
      motif: motif.trim(),
      piecesJointesUrls: [],
    });

    setSubmittedRecoursId(created.id);
  }

  if (submittedRecoursId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{dict.success.title}</h2>
        <p className="mt-3 max-w-sm text-sm text-slate-500">
          {dict.success.desc}
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/operateur/recours`)}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#4CAF50" }}
          >
            {dict.success.viewList}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/operateur/recours/${submittedRecoursId}`)}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {dict.success.viewDetail}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{dict.header.title}</h1>
          <p className="text-xs text-slate-500">
            {dict.header.subtitle}
            {aoReferenceFromQuery ? (
              <span className="font-semibold" style={{ color: "#4CAF50" }}> - {aoReferenceFromQuery}</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{dict.context.title}</h2>
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{dict.context.ao}</p>
              <p className="mt-0.5 font-mono text-sm font-bold" style={{ color: "#4CAF50" }}>{aoSelection?.reference || aoReferenceFromQuery || "-"}</p>
              <p className="text-sm text-slate-700">{aoSelection?.object || aoObjectFromQuery || dict.context.emptyAo}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 border-t border-slate-100 pt-4">
              <InfoItem icon={<Building2 className="h-4 w-4" />} label={dict.context.winner} value={winnerFromQuery || "-"} />
              <InfoItem icon={<DollarSign className="h-4 w-4" />} label={dict.context.amount} value={selectedAttribution?.montantAttribue || montantFromQuery || "-"} />
              <InfoItem icon={<CalendarDays className="h-4 w-4" />} label={dict.context.date} value={fmt(selectedAttribution?.dateAttribution || dateAttributionFromQuery, locale)} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{dict.info.title}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  {dict.info.aoSelect} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={aoId}
                  onChange={(event) => setAoId(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-[#4CAF50] focus:bg-white"
                  disabled={isLoadingOptions || !aos.length}
                >
                  {!aos.length && <option value="">{dict.info.noAo}</option>}
                  {aos.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  {dict.info.decisionSelect} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={attributionId}
                  onChange={(event) => setAttributionId(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-[#4CAF50] focus:bg-white"
                  disabled={isLoadingOptions || !availableAttributions.length}
                >
                  {!availableAttributions.length && <option value="">{dict.info.noDecision}</option>}
                  {availableAttributions.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {isOptionsError && (
              <p className="text-[11px] text-rose-700">{dict.info.errorLoad}</p>
            )}
            {!idsValid && (aoId || attributionId) ? (
              <p className="text-[11px] text-amber-700">{dict.info.required}</p>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{dict.content.title}</h2>

            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {dict.content.motifLabel} <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={motif}
                onChange={(event) => setMotif(event.target.value)}
                rows={8}
                placeholder={dict.content.motifPholder}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
              />
              <div className="mt-1 flex justify-between">
                <p className="text-[10px] text-slate-400">{dict.content.minChars}</p>
                <p className={`text-[10px] ${motifValid ? "text-emerald-600" : "text-slate-400"}`}>{motif.length} {dict.content.chars}</p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">{dict.content.filesLabel}</label>
              <div
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                  isDragging ? "border-[#4CAF50] bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Upload className="mb-2 h-6 w-6 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">{dict.content.dragText}</p>
                <p className="text-xs text-slate-400">{dict.content.or}</p>
                <label className="mt-2 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  {dict.content.browse}
                  <input type="file" multiple className="sr-only" onChange={handleFileInput} />
                </label>
              </div>

              <p className="mt-2 text-[10px] text-slate-400">
                {dict.content.filesDesc}
              </p>

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((file) => (
                    <li key={file.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{file.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {isExpired ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
              <p className="text-sm font-bold text-rose-800">{dict.sidebar.expiredTitle}</p>
              <p className="mt-1 text-xs text-rose-700">{dict.sidebar.expiredDesc} {fmt(effectiveRecoursEndDate, locale)}.</p>
            </div>
          ) : (
            <div className={`rounded-xl border p-5 ${days > 0 ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-800">{days > 0 ? days : "-"} <span className="text-base font-semibold">{dict.sidebar.daysText}{days > 1 ? dict.sidebar.daysPlural : ""}</span></p>
              <p className="text-xs font-semibold text-emerald-700">{dict.sidebar.remainingText}{days > 1 ? dict.sidebar.remainingPlural : ""}</p>
              <p className="mt-2 text-[10px] text-emerald-600">{dict.sidebar.deadline} {fmt(effectiveRecoursEndDate, locale)}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{dict.sidebar.noteTitle}</h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                {dict.sidebar.note1}
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                {dict.sidebar.note2}
              </li>
            </ul>
          </div>

          {createMutation.isError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {createMutation.error?.message || dict.sidebar.errorCreate}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || createMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "#4CAF50" }}
            >
              <Send className="h-4 w-4" />
              {createMutation.isPending ? dict.sidebar.submitting : dict.sidebar.submit}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {dict.sidebar.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
