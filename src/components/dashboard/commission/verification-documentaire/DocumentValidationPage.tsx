"use client";

import { useState, useEffect } from "react";
import { commissionTranslations } from "@/i18n/commission-translations";

interface Props {
  locale: string;
  soumissionId?: string;
}

type DocType = "RC" | "NIF" | "NIS" | "Casier" | "CNAS" | "CASNOS" | "Attestation Fiscale" | "Bilan";

interface DocFile {
  id: string;
  type: DocType;
  filename: string;
  filesize: string;
  dateExpiration: string;
  ocr: {
    scoreConformite: number;
    isConforme: boolean;
    anomalies: { fr: string; ar: string }[];
    donneesExtraites: { keyFr: string; keyAr: string; value: string; highlight?: boolean }[];
  };
  decision: "valide" | "invalide" | null;
  commentaire: string;
}

const DOC_TYPES: DocType[] = ["RC", "NIF", "NIS", "Casier", "CNAS", "CASNOS", "Attestation Fiscale", "Bilan"];

const DOCUMENTS_MOCK: DocFile[] = [
  {
    id: "d1", type: "RC", filename: "RC_TechSolutions_2023.pdf", filesize: "2.4 MB", dateExpiration: "31/12/2025",
    ocr: {
      scoreConformite: 98, isConforme: true, anomalies: [],
      donneesExtraites: [
        { keyFr: "N° immatriculation", keyAr: "رقم التسجيل",       value: "16B0987654" },
        { keyFr: "Raison Sociale",     keyAr: "الاسم الاجتماعي",   value: "TECHSOLUTIONS SPA" },
        { keyFr: "Date validité",      keyAr: "تاريخ الصلاحية",    value: "31/12/2025", highlight: true },
        { keyFr: "Code activité",      keyAr: "رمز النشاط",        value: "602101 - Informatique" },
      ],
    },
    decision: null, commentaire: "",
  },
  {
    id: "d2", type: "NIF", filename: "NIF_TechSolutions_2023.pdf", filesize: "1.1 MB", dateExpiration: "31/12/2024",
    ocr: {
      scoreConformite: 75, isConforme: false,
      anomalies: [
        { fr: "Date d'expiration proche (< 3 mois)", ar: "تاريخ الانتهاء قريب (< 3 أشهر)" },
        { fr: "Numéro partiellement illisible",       ar: "الرقم غير مقروء جزئياً" },
      ],
      donneesExtraites: [
        { keyFr: "N° NIF",         keyAr: "رقم التعريف الجبائي", value: "099316000124**" },
        { keyFr: "Raison Sociale", keyAr: "الاسم الاجتماعي",    value: "TECHSOLUTIONS SPA" },
        { keyFr: "Date validité",  keyAr: "تاريخ الصلاحية",     value: "31/12/2024", highlight: true },
      ],
    },
    decision: null, commentaire: "",
  },
  {
    id: "d3", type: "CNAS", filename: "CNAS_TechSolutions_2023.pdf", filesize: "0.8 MB", dateExpiration: "30/06/2025",
    ocr: {
      scoreConformite: 91, isConforme: true, anomalies: [],
      donneesExtraites: [
        { keyFr: "N° affilié",       keyAr: "رقم الانخراط",    value: "16-00456789" },
        { keyFr: "Raison Sociale",   keyAr: "الاسم الاجتماعي", value: "TECHSOLUTIONS SPA" },
        { keyFr: "Date attestation", keyAr: "تاريخ الشهادة",   value: "15/01/2024" },
        { keyFr: "Situation",        keyAr: "الوضعية",          value: "À jour" },
      ],
    },
    decision: null, commentaire: "",
  },
];

export default function DocumentValidationPage({ locale, soumissionId = "S-2023-004" }: Props) {
  const isAr = locale === "ar";
  const t = commissionTranslations[isAr ? "ar" : "fr"];
  const td = t.document;

  const [activeDocId, setActiveDocId] = useState<string>(DOCUMENTS_MOCK[0].id);
  const [docs, setDocs] = useState<DocFile[]>(DOCUMENTS_MOCK);
  const [selectedType, setSelectedType] = useState<DocType>("RC");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch real documents from API
  useEffect(() => {
    if (!soumissionId) return;
    (async () => {
      try {
        const { apiClient } = await import("@/services/client");
        const realDocs = await apiClient<DocFile[]>(`/api/v1/documents/administrative/${soumissionId}`, { method: "GET" }).catch(() => []);
        if (Array.isArray(realDocs) && realDocs.length > 0) {
          setDocs(realDocs);
          setActiveDocId(realDocs[0].id);
        }
      } catch { /* keep mock fallback */ }
    })();
  }, [soumissionId]);
  const [saved, setSaved] = useState(false);

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? docs[0];

  const setDecision = (id: string, decision: "valide" | "invalide") => {
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, decision } : d));
    setSaved(false);
  };

  return (
    <div style={{ minHeight: "100%", direction: isAr ? "rtl" : "ltr" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>{td.titre}</h1>
        <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "#F0EDED", color: "#364150", border: "1px solid #E5E7EB" }}>
          {t.commissionBadge}
        </span>
      </div>

      {/* Soumission header */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "16px 22px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1B1C1C", margin: "0 0 3px" }}>{td.dossierTitre(soumissionId)}</h2>
          <p style={{ fontSize: 13, color: "#6F7A6B", margin: 0 }}>{td.operateur}</p>
        </div>
        {/* Doc type selector */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: "#fff", color: "#364150", border: "1px solid #E5E7EB", cursor: "pointer", minWidth: 200 }}>
            {selectedType}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginInlineStart: "auto" }}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {dropdownOpen && (
            <div style={{ position: "absolute", insetInlineEnd: 0, top: "calc(100% + 4px)", zIndex: 20, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB", borderRadius: 12, padding: "6px", width: 210 }}>
              {DOC_TYPES.map((type) => (
                <button key={type} onClick={() => { setSelectedType(type); setDropdownOpen(false); }}
                  style={{ display: "block", width: "100%", textAlign: isAr ? "right" : "left", padding: "8px 12px", borderRadius: 8, fontSize: 13, background: selectedType === type ? "rgba(76,175,80,0.08)" : "transparent", color: selectedType === type ? "#2e7d32" : "#6F7A6B", fontWeight: selectedType === type ? 600 : 400, border: "none", cursor: "pointer" }}>
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Doc tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {docs.map((doc) => (
          <button key={doc.id} onClick={() => setActiveDocId(doc.id)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600, flexShrink: 0, cursor: "pointer", background: activeDocId === doc.id ? "#364150" : "#fff", color: activeDocId === doc.id ? "#fff" : "#6F7A6B", border: "1px solid #E5E7EB" }}>
            {doc.type}
            {doc.decision === "valide" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} />}
            {doc.decision === "invalide" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />}
          </button>
        ))}
      </div>

      {/* Two-column */}
      <div style={{ display: "flex", gap: 20, alignItems: "stretch" }}>

        {/* Left: PDF */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignSelf: "stretch" }}>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>

            {/* Toolbar - dark */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#1E293B" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#E2E8F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%" }}>
                {activeDoc.filename} ({activeDoc.filesize})
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <button title={td.zoomIn} style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="#CBD5E1" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button title={td.zoomOut} style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="#CBD5E1" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35M8 11h6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button title={td.telecharger} style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V19a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* PDF area - flex:1 fills remaining height */}
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

          {/* OCR card */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1B1C1C", margin: 0, lineHeight: 1.4 }}>
                {isAr ? "تحليل الذكاء الاصطناعي" : "Analyse IA"}<br />
                {isAr ? "(OCR & NLP)" : "(OCR & NLP)"}
              </h3>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: activeDoc.ocr.isConforme ? "rgba(76,175,80,0.12)" : "rgba(239,68,68,0.08)", color: activeDoc.ocr.isConforme ? "#2e7d32" : "#dc2626", whiteSpace: "nowrap", flexShrink: 0, textAlign: "center", lineHeight: 1.5 }}>
                {isAr ? `نسبة المطابقة:\n${activeDoc.ocr.scoreConformite}%` : `Score de\nConformité: ${activeDoc.ocr.scoreConformite}%`}
              </span>
            </div>

            {/* Extracted data */}
            <div style={{ background: "#F8FAFC", border: "1px solid #F0EDED", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>
                {td.donneesExtraites}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {activeDoc.ocr.donneesExtraites.map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#9CA3AF", flexShrink: 0 }}>
                      {isAr ? row.keyAr : row.keyFr}:
                    </span>
                    <span style={{ fontSize: 12, fontWeight: row.highlight ? 700 : 500, color: row.highlight ? "#4CAF50" : "#364150", textAlign: isAr ? "left" : "right" }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conformity */}
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

          {/* Validation card */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "18px 20px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#364150", marginBottom: 14 }}>{td.decisionTitre}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              <button onClick={() => setDecision(activeDoc.id, "invalide")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: activeDoc.decision === "invalide" ? "#FEE2E2" : "#fff", color: "#dc2626", border: `2px solid ${activeDoc.decision === "invalide" ? "#EF4444" : "#FCA5A5"}`, cursor: "pointer" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {td.refuser}
              </button>
              <button onClick={() => setDecision(activeDoc.id, "valide")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#4CAF50", color: "#fff", border: "2px solid #4CAF50", cursor: "pointer" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
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

            <button onClick={() => setSaved(true)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: saved ? "rgba(76,175,80,0.1)" : "#364150", color: saved ? "#2e7d32" : "#fff", border: "none", cursor: "pointer" }}>
              {saved ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>{td.enregistreSuccess}</>
              ) : td.enregistrer}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}