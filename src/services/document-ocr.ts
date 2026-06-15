import { apiClient } from "@/services/client";

export interface AdminPiece {
  id: string;
  documentId: string;
  type: string;
  designation?: string;
  isValide?: boolean;
  dateExpiration?: string;
}

export interface DocumentOcrResult {
  texteExtrait: string | null;
  scoreConfiance: number | null;
  isConforme: boolean | null;
  anomalies: unknown[] | null;
  analysedAt: string | null;
}

export async function getAdminPiecesForSoumission(soumissionId: string): Promise<AdminPiece[]> {
  const raw = await apiClient<unknown>(
    `/api/v1/documents/administrative/${soumissionId}`,
    { method: "GET" },
  );
  return Array.isArray(raw) ? (raw as AdminPiece[]) : [];
}

export async function getDocumentOcrResult(documentId: string): Promise<DocumentOcrResult> {
  const raw = await apiClient<DocumentOcrResult>(
    `/api/v1/documents/${documentId}/ocr`,
    { method: "GET" },
  );
  return raw ?? { texteExtrait: null, scoreConfiance: null, isConforme: null, anomalies: null, analysedAt: null };
}
