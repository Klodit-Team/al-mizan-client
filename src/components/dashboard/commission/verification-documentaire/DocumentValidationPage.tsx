"use client";

import { useState } from "react";

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
    anomalies: string[];
    donneesExtraites: Record<string, string>;
  };
  decision: "valide" | "invalide" | null;
  commentaire: string;
}

const DOC_TYPES: DocType[] = ["RC", "NIF", "NIS", "Casier", "CNAS", "CASNOS", "Attestation Fiscale", "Bilan"];

const DOCUMENTS_MOCK: DocFile[] = [
  {
    id: "d1",
    type: "RC",
    filename: "RC_TechSolutions_2023.pdf",
    filesize: "2.4 MB",
    dateExpiration: "31/12/2025",
    ocr: {
      scoreConformite: 98,
      isConforme: true,
      anomalies: [],
      donneesExtraites: {
        "N° immatriculation": "16B0987654",
        "Raison Sociale": "TECHSOLUTIONS SPA",
        "Date validité": "31/12/2025",
        "Code activité": "602101 - Informatique",
      },
    },
    decision: null,
    commentaire: "",
  },
  {
    id: "d2",
    type: "NIF",
    filename: "NIF_TechSolutions_2023.pdf",
    filesize: "1.1 MB",
    dateExpiration: "31/12/2024",
    ocr: {
      scoreConformite: 75,
      isConforme: false,
      anomalies: ["Date d'expiration proche (< 3 mois)", "Numéro partiellement illisible"],
      donneesExtraites: {
        "N° NIF": "099316000124**",
        "Raison Sociale": "TECHSOLUTIONS SPA",
        "Date validité": "31/12/2024",
      },
    },
    decision: null,
    commentaire: "",
  },
  {
    id: "d3",
    type: "CNAS",
    filename: "CNAS_TechSolutions_2023.pdf",
    filesize: "0.8 MB",
    dateExpiration: "30/06/2025",
    ocr: {
      scoreConformite: 91,
      isConforme: true,
      anomalies: [],
      donneesExtraites: {
        "N° affilié": "16-00456789",
        "Raison Sociale": "TECHSOLUTIONS SPA",
        "Date attestation": "15/01/2024",
        "Situation": "À jour",
      },
    },
    decision: null,
    commentaire: "",
  },
];

export default function DocumentValidationPage({ locale: _locale, soumissionId = "S-2023-004" }: Props) {
  const [activeDocId, setActiveDocId] = useState<string>(DOCUMENTS_MOCK[0].id);
  const [docs, setDocs] = useState<DocFile[]>(DOCUMENTS_MOCK);
  const [selectedType, setSelectedType] = useState<DocType>("RC");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? docs[0];

  const setDecision = (id: string, decision: "valide" | "invalide") => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, decision } : d)));
    setSaved(false);
  };

  const setCommentaire = (id: string, val: string) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, commentaire: val } : d)));
    setSaved(false);
  };

  return (
    <div style={{ minHeight: "100%" }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>
          Vérification Documentaire
        </h1>
        <span
          style={{
            fontSize: 12,
            padding: "4px 12px",
            borderRadius: 999,
            background: "#F0EDED",
            color: "#364150",
            border: "1px solid #E5E7EB",
          }}
        >
          Commission d&apos;Évaluation
        </span>
      </div>

      {/* ── Soumission header ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: "16px 22px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1B1C1C", margin: "0 0 3px" }}>
            Dossier Administratif : {soumissionId}
          </h2>
          <p style={{ fontSize: 13, color: "#6F7A6B", margin: 0 }}>
            Opérateur : TechSolutions SPA
          </p>
        </div>

        {/* Document type selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              background: "#fff",
              color: "#364150",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              minWidth: 210,
            }}
          >
            {selectedType}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto" }}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 4px)",
                zIndex: 20,
                background: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: "6px",
                width: 210,
              }}
            >
              {DOC_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => { setSelectedType(t); setDropdownOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    background: selectedType === t ? "rgba(76,175,80,0.08)" : "transparent",
                    color: selectedType === t ? "#2e7d32" : "#6F7A6B",
                    fontWeight: selectedType === t ? 600 : 400,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Document tabs ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {docs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setActiveDocId(doc.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
              cursor: "pointer",
              background: activeDocId === doc.id ? "#364150" : "#fff",
              color: activeDocId === doc.id ? "#fff" : "#6F7A6B",
              border: "1px solid #E5E7EB",
            }}
          >
            {doc.type}
            {doc.decision === "valide" && (
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} />
            )}
            {doc.decision === "invalide" && (
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Main two-column layout ── */}
      <div style={{ display: "flex", gap: 20, alignItems: "stretch" }}>

        {/* Left: PDF preview */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignSelf: "stretch" }}>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
            {/* File toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                background: "#1E293B",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: "#E2E8F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%" }}>
                {activeDoc.filename} ({activeDoc.filesize})
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {/* Zoom in */}
                <button title="Zoom in" style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="#CBD5E1" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {/* Zoom out */}
                <button title="Zoom out" style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="#CBD5E1" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35M8 11h6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {/* Download */}
                <button title="Télécharger" style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V19a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* PDF area */}
            <div
              style={{
                flex: 1,
                minHeight: 400,
                background: "#F8FAFC",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25, marginBottom: 10 }}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#BECAB9" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p style={{ fontSize: 13, color: "#BECAB9" }}>Aperçu du PDF généré ici</p>
            </div>
          </div>
        </div>

        {/* Right: OCR + Validation */}
        <div style={{ width: 310, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* OCR Analysis card */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1B1C1C", margin: 0, lineHeight: 1.4 }}>
                Analyse IA<br />(OCR &amp; NLP)
              </h3>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: activeDoc.ocr.isConforme ? "rgba(76,175,80,0.12)" : "rgba(239,68,68,0.08)",
                  color: activeDoc.ocr.isConforme ? "#2e7d32" : "#dc2626",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                Score de<br />Conformité: {activeDoc.ocr.scoreConformite}%
              </span>
            </div>

            {/* Extracted data */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #F0EDED",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 12,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#9CA3AF",
                  marginBottom: 10,
                }}
              >
                Données Extraites
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {Object.entries(activeDoc.ocr.donneesExtraites).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#9CA3AF", flexShrink: 0 }}>{key}:</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: key === "Date validité" ? 700 : 500,
                        color: key === "Date validité" ? "#4CAF50" : "#364150",
                        textAlign: "right",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conformity status */}
            {activeDoc.ocr.isConforme ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(76,175,80,0.06)",
                  border: "1px solid rgba(76,175,80,0.2)",
                  color: "#2e7d32",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                </svg>
                Aucune anomalie détectée. Le document correspond aux exigences du cahier des charges.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeDoc.ocr.anomalies.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#dc2626",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation card */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "18px 20px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#364150", marginBottom: 14 }}>
              Décision du vérificateur :
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <button
                onClick={() => setDecision(activeDoc.id, "invalide")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "11px 8px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  background: activeDoc.decision === "invalide" ? "#FEE2E2" : "#fff",
                  color: "#dc2626",
                  border: `2px solid ${activeDoc.decision === "invalide" ? "#EF4444" : "#FCA5A5"}`,
                  cursor: "pointer",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Refuser la pièce
              </button>
              <button
                onClick={() => setDecision(activeDoc.id, "valide")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "11px 8px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#4CAF50",
                  color: "#fff",
                  border: "2px solid #4CAF50",
                  cursor: "pointer",
                  opacity: activeDoc.decision === "valide" ? 1 : 0.9,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Valider la pièce (Conforme)
              </button>
            </div>

            <textarea
              rows={3}
              value={activeDoc.commentaire}
              onChange={(e) => setCommentaire(activeDoc.id, e.target.value)}
              placeholder="Commentaire optionnel…"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 13,
                outline: "none",
                resize: "none",
                background: "#F5F7FA",
                border: "1px solid #E5E7EB",
                color: "#364150",
                boxSizing: "border-box",
                marginBottom: 12,
              }}
            />

            <button
              onClick={() => setSaved(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "11px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                background: saved ? "rgba(76,175,80,0.1)" : "#364150",
                color: saved ? "#2e7d32" : "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {saved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Décisions enregistrées
                </>
              ) : (
                "Enregistrer les décisions"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}