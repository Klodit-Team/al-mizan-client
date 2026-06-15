"use client";

export interface OcrPieceResult {
  pieceType: string;
  conformityBadge: "conforme" | "non_conforme" | "pending";
  extractedFields: { keyFr: string; keyAr: string; value: string }[];
  anomalies: { fr: string; ar: string }[];
  confidenceScore: number;
  analysedAt: string | null;
}

interface Props {
  isAr: boolean;
  pieces: OcrPieceResult[];
  isLoading?: boolean;
}

function ConformityBadge({ status, isAr }: { status: OcrPieceResult["conformityBadge"]; isAr: boolean }) {
  if (status === "conforme") {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(76,175,80,0.12)", color: "#2e7d32" }}>
        {isAr ? "مطابق" : "Conforme"}
      </span>
    );
  }
  if (status === "non_conforme") {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
        {isAr ? "غير مطابق" : "Non conforme"}
      </span>
    );
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(156,163,175,0.12)", color: "#6B7280" }}>
      {isAr ? "في انتظار تحليل OCR" : "En attente d'analyse OCR"}
    </span>
  );
}

export default function SoumissionOcrAnalysis({ isAr, pieces, isLoading = false }: Props) {
  const dir = isAr ? "rtl" : "ltr";

  if (isLoading) {
    return (
      <div style={{ direction: dir, display: "flex", flexDirection: "column", gap: 12 }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "16px 18px" }}>
            <div className="animate-pulse" style={{ height: 14, width: "40%", background: "#F1F5F9", borderRadius: 6, marginBottom: 10 }} />
            <div className="animate-pulse" style={{ height: 12, background: "#F1F5F9", borderRadius: 6, marginBottom: 6 }} />
            <div className="animate-pulse" style={{ height: 12, width: "60%", background: "#F1F5F9", borderRadius: 6 }} />
          </div>
        ))}
      </div>
    );
  }

  if (pieces.length === 0) {
    return (
      <div style={{ direction: dir, textAlign: "center", padding: "28px", background: "#F8FAFC", borderRadius: 14, border: "1px solid #E5E7EB" }}>
        <p style={{ fontSize: 13, color: "#9CA3AF" }}>
          {isAr ? "تحليل OCR في انتظار المعالجة" : "Analyse OCR en attente"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ direction: dir, display: "flex", flexDirection: "column", gap: 12 }}>
      {pieces.map((piece, idx) => (
        <div key={idx} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "16px 18px" }}>
          {/* Piece header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1B1C1C" }}>{piece.pieceType}</span>
            <ConformityBadge status={piece.conformityBadge} isAr={isAr} />
            <span style={{ fontSize: 11, color: "#9CA3AF", marginInlineStart: "auto" }}>
              {isAr ? "الثقة:" : "Confiance :"} {Math.round(piece.confidenceScore * 100)}%
            </span>
          </div>

          {/* Extracted fields */}
          {piece.extractedFields.length > 0 && (
            <div style={{ background: "#F8FAFC", border: "1px solid #F0EDED", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
              {piece.extractedFields.map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: i < piece.extractedFields.length - 1 ? 6 : 0 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{isAr ? f.keyAr : f.keyFr}:</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#364150" }}>{f.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Anomalies */}
          {piece.anomalies.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {piece.anomalies.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "7px 10px", borderRadius: 8, background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.25)", fontSize: 11, color: "#92400e" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  {isAr ? a.ar : a.fr}
                </div>
              ))}
            </div>
          ) : piece.conformityBadge !== "pending" && (
            <div style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic" }}>
              {isAr ? "لا توجد شذوذات مكتشفة" : "Aucune anomalie détectée"}
            </div>
          )}

          {/* Timestamp */}
          {piece.analysedAt && (
            <p style={{ fontSize: 10, color: "#9CA3AF", margin: "10px 0 0" }}>
              {isAr ? "تاريخ التحليل:" : "Analysé le"}{" "}
              {new Date(piece.analysedAt).toLocaleString(isAr ? "ar-DZ" : "fr-DZ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
