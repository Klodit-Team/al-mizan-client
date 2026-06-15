"use client";

export interface AnomalyDetectionSummary {
  totalFlagged: number;
  collusionCount: number;
  collusionConfidenceRange: [number, number] | null;
  pricePatternCount: number;
  pricePatternConfidenceRange: [number, number] | null;
  saucissonnageCount: number;
  saucissonnageConfidenceRange: [number, number] | null;
  flaggedBids: {
    anonymousRef: string;
    anomalyType: string;
    detail: string;
    confidence: number;
  }[];
}

interface Props {
  isAr: boolean;
  aoId: string;
  locale: string;
  summary: AnomalyDetectionSummary | null | undefined;
  isLoading?: boolean;
  showIncidentsLink?: boolean;
}

function ConfidenceRange({ range, isAr }: { range: [number, number] | null; isAr: boolean }) {
  if (!range) return null;
  return (
    <span style={{ fontSize: 11, color: "#9CA3AF" }}>
      {isAr ? `الثقة: ${Math.round(range[0] * 100)}–${Math.round(range[1] * 100)}%` : `Confiance : ${Math.round(range[0] * 100)}–${Math.round(range[1] * 100)}%`}
    </span>
  );
}

export default function AoAnomalyDetectionCard({
  isAr, aoId, locale, summary, isLoading = false, showIncidentsLink = false,
}: Props) {
  const dir = isAr ? "rtl" : "ltr";

  const containerStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    overflow: "hidden",
    direction: dir,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    borderBottom: "1px solid #F3F4F6",
  };

  if (isLoading || summary === undefined) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1B1C1C" }}>
            {isAr ? "تحليل الشذوذات بالذكاء الاصطناعي" : "Analyse d'anomalies IA"}
          </span>
        </div>
        <div style={{ padding: "24px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-bounce" style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#9CA3AF" }}>
            {isAr ? "جارٍ الكشف عن الشذوذات…" : "Détection d'anomalies en cours…"}
          </p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1B1C1C" }}>
            {isAr ? "تحليل الشذوذات بالذكاء الاصطناعي" : "Analyse d'anomalies IA"}
          </span>
        </div>
        <div style={{ padding: "20px 18px", textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>
          {isAr ? "لا توجد بيانات متاحة" : "Aucune donnée disponible"}
        </div>
      </div>
    );
  }

  const allClear = summary.totalFlagged === 0;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1B1C1C" }}>
          {isAr ? "تحليل الشذوذات بالذكاء الاصطناعي" : "Analyse d'anomalies IA"}
        </span>
      </div>

      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Global result banner */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: allClear ? "rgba(76,175,80,0.07)" : "rgba(234,179,8,0.07)", border: `1px solid ${allClear ? "rgba(76,175,80,0.2)" : "rgba(234,179,8,0.3)"}` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            {allClear
              ? <><path d="M9 12l2 2 4-4" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="#2e7d32" strokeWidth="2" /></>
              : <><path d="M12 8v4M12 16h.01" stroke="#92400e" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="#92400e" strokeWidth="2" /></>
            }
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: allClear ? "#2e7d32" : "#92400e" }}>
            {allClear
              ? (isAr ? "لم يتم اكتشاف أي شذوذ" : "Aucune anomalie détectée")
              : (isAr ? `تم اكتشاف ${summary.totalFlagged} شذوذ(ات)` : `${summary.totalFlagged} anomalie(s) détectée(s)`)}
          </span>
        </div>

        {/* Type breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { labelFr: "Collusion", labelAr: "التواطؤ", count: summary.collusionCount, range: summary.collusionConfidenceRange },
            { labelFr: "Pattern de prix", labelAr: "نمط الأسعار", count: summary.pricePatternCount, range: summary.pricePatternConfidenceRange },
            { labelFr: "Saucissonnage", labelAr: "التجزئة التعسفية", count: summary.saucissonnageCount, range: summary.saucissonnageConfidenceRange },
          ].map((row) => (
            <div key={row.labelFr} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, flex: 1, color: "#364150", fontWeight: row.count > 0 ? 600 : 400 }}>
                {isAr ? row.labelAr : row.labelFr}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 999, minWidth: 28, textAlign: "center", background: row.count > 0 ? "rgba(234,179,8,0.1)" : "rgba(156,163,175,0.08)", color: row.count > 0 ? "#92400e" : "#9CA3AF" }}>
                {row.count}
              </span>
              <ConfidenceRange range={row.range} isAr={isAr} />
            </div>
          ))}
        </div>

        {/* Flagged bids list */}
        {summary.flaggedBids.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9CA3AF", margin: 0 }}>
              {isAr ? "العروض المُبلَّغ عنها" : "Offres signalées"}
            </p>
            {summary.flaggedBids.map((bid, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4CAF50", flexShrink: 0 }}>{bid.anonymousRef}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#364150", marginBottom: 2 }}>{bid.anomalyType}</div>
                  <div style={{ fontSize: 11, color: "#6F7A6B" }}>{bid.detail}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "rgba(234,179,8,0.1)", color: "#92400e", flexShrink: 0 }}>
                  {Math.round(bid.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Link to incidents (admin/controleur only) */}
        {showIncidentsLink && summary.totalFlagged > 0 && (
          <a
            href={`/${locale}/dashboard/admin/id/incidents?aoId=${aoId}`}
            style={{ fontSize: 12, fontWeight: 600, color: "#4CAF50", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            {isAr ? "عرض حوادث الذكاء الاصطناعي ←" : "Voir les incidents IA →"}
          </a>
        )}
      </div>
    </div>
  );
}
