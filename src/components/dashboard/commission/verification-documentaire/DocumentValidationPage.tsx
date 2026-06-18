"use client";

import { useState, useEffect } from "react";
import { commissionTranslations } from "@/i18n/commission-translations";
import {
  useResultatsOuvertureQuery,
  useAddResultatMutation,
  useUpdateResultatMutation,
  useMesCommissionsQuery,
} from "@/services/commission-dashboard/queries";
import { useCommissionAoSubmissionsQuery } from "@/services/commission/queries";

interface Props {
  locale: string;
  soumissionId?: string;
  seanceId?: string;
  // documents : sera injecté par le service documents quand il sera branché
  // GET /api/v1/documents?soumissionId=:id
  documents?: DocFile[];
}

type DocType =
  | "RC" | "NIF" | "NIS" | "Casier"
  | "CNAS" | "CASNOS" | "Attestation Fiscale" | "Bilan";

interface OcrAnomaline {
  fr: string;
  ar: string;
}

interface OcrDonnee {
  keyFr: string;
  keyAr: string;
  value: string;
  highlight?: boolean;
}

interface DocOcr {
  scoreConformite: number;
  isConforme: boolean;
  anomalies: OcrAnomaline[];
  donneesExtraites: OcrDonnee[];
}

export interface DocFile {
  id: string;
  type: DocType;
  filename: string;
  filesize: string;
  dateExpiration: string;
  ocr: DocOcr;
  decision: "valide" | "invalide" | null;
  commentaire: string;
}

const DOC_TYPES: DocType[] = [
  "RC", "NIF", "NIS", "Casier",
  "CNAS", "CASNOS", "Attestation Fiscale", "Bilan",
];

// ── État vide : aucun document fourni ──────────────────────────────────────────
function EmptyDocuments({ isAr }: { isAr: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "72px 24px",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            stroke="#D1D5DB"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", margin: "0 0 4px" }}>
          {isAr ? "لا توجد وثائق" : "Aucun document"}
        </p>
        <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
          {isAr
            ? "لم يتم تحميل وثائق هذا العرض بعد"
            : "Aucun document n'a encore été transmis pour cette soumission"}
        </p>
      </div>
    </div>
  );
}

export default function DocumentValidationPage({
  locale,
  soumissionId: propSoumissionId = "",
  seanceId: propSeanceId = "",
  documents = [],
}: Props) {
  const isAr = locale === "ar";
  const t = commissionTranslations[isAr ? "ar" : "fr"];
  const td = t.document;

  // ── Local states for active selection ────────────────────────────────────
  const [activeSoumissionId, setActiveSoumissionId] = useState<string>(propSoumissionId);
  const [activeSeanceId, setActiveSeanceId] = useState<string>(propSeanceId);

  // Sync with prop changes
  useEffect(() => {
    setActiveSoumissionId(propSoumissionId);
  }, [propSoumissionId]);

  useEffect(() => {
    setActiveSeanceId(propSeanceId);
  }, [propSeanceId]);

  // ── Données live : résultats d'ouverture pour synchroniser estConforme ────
  const { data: resultats } = useResultatsOuvertureQuery(activeSeanceId);
  const addResultatMutation = useAddResultatMutation(activeSeanceId);
  const updateResultatMutation = useUpdateResultatMutation(activeSeanceId, "");
  const existingResultat = resultats?.find((r) => r.soumissionId === activeSoumissionId);

  // ── State local basé sur les documents props ───────────────────────────────
  const [activeDocId, setActiveDocId] = useState<string | null>(
    documents[0]?.id ?? null
  );
  const [docs, setDocs] = useState<DocFile[]>(documents);
  const [selectedType, setSelectedType] = useState<DocType>("RC");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch real documents from API
  useEffect(() => {
    if (!activeSoumissionId) {
      setDocs([]);
      setActiveDocId(null);
      return;
    }
    (async () => {
      try {
        const { apiClient } = await import("@/services/client");
        const realDocs = await apiClient<DocFile[]>(`/api/v1/documents/administrative/${activeSoumissionId}`, { method: "GET" }).catch(() => []);
        if (Array.isArray(realDocs) && realDocs.length > 0) {
          setDocs(realDocs);
          setActiveDocId(realDocs[0].id);
        } else {
          setDocs([]);
          setActiveDocId(null);
        }
      } catch {
        // Keep the current state if the backend call fails.
      }
    })();
  }, [activeSoumissionId]);

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Dropdown / Selection logic when soumissionId is not selected ──────────
  const { data: mesCommissions, isLoading: loadingCommissions } = useMesCommissionsQuery();
  const [selectedCommissionId, setSelectedCommissionId] = useState<string>("");

  // Auto-select first commission once loaded
  useEffect(() => {
    if (mesCommissions?.commissionsEvaluation?.length && !selectedCommissionId) {
      setSelectedCommissionId(mesCommissions.commissionsEvaluation[0].id);
    }
  }, [mesCommissions, selectedCommissionId]);

  const selectedCommission = mesCommissions?.commissionsEvaluation?.find((c) => c.id === selectedCommissionId) ?? null;
  const selectedAoId = selectedCommission?.appelOffreId ?? selectedCommission?.aoId ?? "";

  const { data: submissions = [], isLoading: loadingSubmissions } = useCommissionAoSubmissionsQuery(selectedAoId, Boolean(selectedAoId));

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? null;

  const setDecision = (id: string, decision: "valide" | "invalide") => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, decision } : d)));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeSeanceId && activeSoumissionId) {
        const allValid = docs.every((d) => d.decision !== "invalide");
        const observations = docs
          .filter((d) => d.commentaire)
          .map((d) => `${d.type}: ${d.commentaire}`)
          .join(" | ");
        if (existingResultat) {
          await updateResultatMutation.mutateAsync({ estConforme: allValid, observations });
        } else {
          await addResultatMutation.mutateAsync({ soumissionId: activeSoumissionId, estConforme: allValid, observations });
        }
      }
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeSoumissionId) {
    return (
      <div style={{ minHeight: "100%", direction: isAr ? "rtl" : "ltr" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>{td.titre}</h1>
          <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "#F0EDED", color: "#364150", border: "1px solid #E5E7EB" }}>
            {t.commissionBadge}
          </span>
        </div>

        {/* Selection Content */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "stretch" }}>
          {/* Left panel: Commissions list */}
          <div style={{ flex: "1 1 300px", minWidth: 280, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#364150", margin: "0 0 12px" }}>
              {isAr ? "اختر اللجنة ولجنة التقييم" : "Sélectionner une commission"}
            </h2>

            {loadingCommissions ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse" style={{ height: 60, borderRadius: 12, background: "#F1F5F9" }} />
                ))}
              </div>
            ) : !mesCommissions?.commissionsEvaluation?.length ? (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                {isAr ? "لا يوجد أي لجنة تقييم نشطة." : "Aucune commission d'évaluation active trouvée."}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mesCommissions.commissionsEvaluation.map((comm) => {
                  const isSelected = comm.id === selectedCommissionId;
                  return (
                    <button
                      key={comm.id}
                      onClick={() => setSelectedCommissionId(comm.id)}
                      style={{
                        textAlign: isAr ? "right" : "left",
                        padding: 12,
                        borderRadius: 12,
                        border: isSelected ? "2px solid #364150" : "1px solid #E5E7EB",
                        background: isSelected ? "#F8FAFC" : "#fff",
                        cursor: "pointer",
                        width: "100%",
                        transition: "all 0.2s",
                      }}
                    >
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1B1C1C", margin: "0 0 4px" }}>
                        {comm.objet}
                      </p>
                      <p style={{ fontSize: 11, color: "#6F7A6B", margin: 0 }}>
                        {comm.reference}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: Submissions list */}
          <div style={{ flex: "2 1 400px", minWidth: 320, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#364150", margin: "0 0 12px" }}>
              {isAr ? "العروض المقدمة للتحقق منها" : "Soumissions à vérifier"}
            </h2>

            {!selectedCommissionId ? (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                {isAr ? "الرجاء اختيار لجنة أولاً." : "Veuillez sélectionner une commission."}
              </p>
            ) : loadingSubmissions ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse" style={{ height: 56, borderRadius: 12, background: "#F1F5F9" }} />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                {isAr ? "لا توجد عروض مقدمة لهذه اللجنة." : "Aucune soumission trouvée pour cette commission."}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {submissions.map((sub) => {
                  const matchingSeance = mesCommissions?.seancesOuverture?.find(
                    (s) => s.appelOffreId === selectedAoId
                  );
                  return (
                    <div
                      key={sub.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid #E5E7EB",
                        background: "#fff",
                        gap: 12,
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1B1C1C", margin: "0 0 2px" }}>
                          {sub.operatorName}
                        </p>
                        <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>
                          {isAr ? "رقم المرجع:" : "Référence :"} <span style={{ fontWeight: 600 }}>{sub.reference}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSoumissionId(sub.id);
                          setActiveSeanceId(matchingSeance?.id ?? "");
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: "#364150",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {isAr ? "التحقق من الوثائق" : "Vérifier le dossier"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", direction: isAr ? "rtl" : "ltr" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveSoumissionId("")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            background: "#F3F4F6",
            border: "1px solid #E5E7EB",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: "#4B5563"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: isAr ? "rotate(180deg)" : "none" }}>
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isAr ? "رجوع" : "Retour"}
        </button>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>{td.titre}</h1>
        <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "#F0EDED", color: "#364150", border: "1px solid #E5E7EB" }}>
          {t.commissionBadge}
        </span>
        {existingResultat && (
          <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: existingResultat.estConforme ? "rgba(76,175,80,0.1)" : "rgba(239,68,68,0.08)", color: existingResultat.estConforme ? "#2e7d32" : "#dc2626", border: "1px solid #E5E7EB" }}>
            {existingResultat.estConforme ? (isAr ? "مطابق" : "Conforme") : (isAr ? "غير مطابق" : "Non conforme")}
          </span>
        )}
      </div>

      {/* Soumission header */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "16px 22px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1B1C1C", margin: "0 0 3px" }}>
            {activeSoumissionId ? td.dossierTitre(activeSoumissionId.slice(-8)) : (isAr ? "دوسيه العرض" : "Dossier soumission")}
          </h2>
          <p style={{ fontSize: 13, color: "#6F7A6B", margin: 0 }}>
            {td.operateur}
            {activeSeanceId && <span style={{ color: "#9CA3AF", marginInlineStart: 8 }}>· {isAr ? "رقم الجلسة" : "Séance"} #{activeSeanceId.slice(-6)}</span>}
          </p>
        </div>

        {/* Doc type selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: "#fff", color: "#364150", border: "1px solid #E5E7EB", cursor: "pointer", minWidth: 200 }}
          >
            {selectedType}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginInlineStart: "auto" }}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {dropdownOpen && (
            <div style={{ position: "absolute", insetInlineEnd: 0, top: "calc(100% + 4px)", zIndex: 20, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB", borderRadius: 12, padding: "6px", width: 210 }}>
              {DOC_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setDropdownOpen(false); }}
                  style={{ display: "block", width: "100%", textAlign: isAr ? "right" : "left", padding: "8px 12px", borderRadius: 8, fontSize: 13, background: selectedType === type ? "rgba(76,175,80,0.08)" : "transparent", color: selectedType === type ? "#2e7d32" : "#6F7A6B", fontWeight: selectedType === type ? 600 : 400, border: "none", cursor: "pointer" }}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aucun document */}
      {docs.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden" }}>
          <EmptyDocuments isAr={isAr} />
        </div>
      ) : (
        <>
          {/* Doc tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600, flexShrink: 0, cursor: "pointer", background: activeDocId === doc.id ? "#364150" : "#fff", color: activeDocId === doc.id ? "#fff" : "#6F7A6B", border: "1px solid #E5E7EB" }}
              >
                {doc.type}
                {doc.decision === "valide" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} />}
                {doc.decision === "invalide" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />}
              </button>
            ))}
          </div>

          {activeDoc && (
            <div style={{ display: "flex", gap: 20, alignItems: "stretch" }}>
              {/* Left: PDF viewer */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Toolbar */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#1E293B" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#E2E8F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%" }}>
                      {activeDoc.filename} ({activeDoc.filesize})
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {[{ title: td.zoomIn, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" }, { title: td.zoomOut, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" }, { title: td.telecharger, d: "M12 10v6m0 0l-3-3m3 3l3-3M3 17V19a2 2 0 002 2h14a2 2 0 002-2v-2" }].map((btn) => (
                        <button key={btn.title} title={btn.title} style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d={btn.d} stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* PDF placeholder */}
                  <div style={{ flex: 1, minHeight: 400, background: "#F8FAFC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25, marginBottom: 10 }}>
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#BECAB9" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p style={{ fontSize: 13, color: "#BECAB9" }}>{td.apercu}</p>
                  </div>
                </div>
              </div>

              {/* Right: OCR + Validation */}
              <div style={{ width: 310, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* OCR Card */}
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1B1C1C", margin: 0, lineHeight: 1.4 }}>
                      {isAr ? "تحليل الذكاء الاصطناعي" : "Analyse IA"}
                      <br />{"(OCR & NLP)"}
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: activeDoc.ocr.isConforme ? "rgba(76,175,80,0.12)" : "rgba(239,68,68,0.08)", color: activeDoc.ocr.isConforme ? "#2e7d32" : "#dc2626", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {isAr ? `نسبة المطابقة: ${activeDoc.ocr.scoreConformite}%` : `Score: ${activeDoc.ocr.scoreConformite}%`}
                    </span>
                  </div>

                  {/* Données extraites */}
                  <div style={{ background: "#F8FAFC", border: "1px solid #F0EDED", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>{td.donneesExtraites}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {activeDoc.ocr.donneesExtraites.map((row, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "#9CA3AF", flexShrink: 0 }}>{isAr ? row.keyAr : row.keyFr}:</span>
                          <span style={{ fontSize: 12, fontWeight: row.highlight ? 700 : 500, color: row.highlight ? "#4CAF50" : "#364150", textAlign: isAr ? "left" : "right" }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Anomalies / Conformité */}
                  {activeDoc.ocr.isConforme ? (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 10, background: "rgba(76,175,80,0.06)", border: "1px solid rgba(76,175,80,0.2)", color: "#2e7d32", fontSize: 12, lineHeight: 1.5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      {td.anomalieAucune}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {activeDoc.ocr.anomalies.map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 12, lineHeight: 1.5 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          {isAr ? a.ar : a.fr}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Validation Card */}
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "18px 20px" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#364150", marginBottom: 14 }}>{td.decisionTitre}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                    <button
                      onClick={() => setDecision(activeDoc.id, "invalide")}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: activeDoc.decision === "invalide" ? "#FEE2E2" : "#fff", color: "#dc2626", border: `2px solid ${activeDoc.decision === "invalide" ? "#EF4444" : "#FCA5A5"}`, cursor: "pointer" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                      {td.refuser}
                    </button>
                    <button
                      onClick={() => setDecision(activeDoc.id, "valide")}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#4CAF50", color: "#fff", border: "2px solid #4CAF50", cursor: "pointer" }}
                    >
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                      {td.valider}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={activeDoc.commentaire}
                    onChange={(e) => setDocs((prev) => prev.map((d) => d.id === activeDoc.id ? { ...d, commentaire: e.target.value } : d))}
                    placeholder={td.commentairePlaceholder}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 13, outline: "none", resize: "none", background: "#F5F7FA", border: "1px solid #E5E7EB", color: "#364150", boxSizing: "border-box", marginBottom: 12, textAlign: isAr ? "right" : "left" }}
                  />
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: saved ? "rgba(76,175,80,0.1)" : isSaving ? "#E5E7EB" : "#364150", color: saved ? "#2e7d32" : isSaving ? "#9CA3AF" : "#fff", border: "none", cursor: isSaving ? "not-allowed" : "pointer" }}
                  >
                    {isSaving ? (isAr ? "جارٍ الحفظ…" : "Enregistrement…") : saved ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>{td.enregistreSuccess}</>
                    ) : td.enregistrer}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
