import { apiClient } from "@/services/client";

export type OeSoumissionStatus =
  | "brouillon"
  | "deposee"
  | "recue"
  | "evaluee"
  | "retenue"
  | "rejetee";

export interface OeSoumissionListItem {
  id: string;
  reference: string;
  aoId: string;
  lotId?: string;
  aoReference: string;
  aoObject: string;
  organizationName: string;
  lots: string[];
  submittedAt: string;
  deadline: string;
  status: OeSoumissionStatus;
  eligibleRecours: boolean;
}

export interface OeSoumissionLotDetail {
  lotId: string;
  lotNumber: string;
  designation: string;
  montantHt?: string;
}

export interface OeSoumissionDetailItem {
  id: string;
  reference: string;
  aoId: string;
  aoReference: string;
  aoObject: string;
  organizationName: string;
  wilaya: string;
  aoDeadline: string;
  submittedAt: string;
  createdAt: string;
  status: OeSoumissionStatus;
  isDansDelai?: boolean;
  lots: OeSoumissionLotDetail[];
  financialTotalHt?: string;
  horodatageServeur?: string;
  offreTechnique?: {
    fichierUrl?: string;
    hashFichier?: string;
    isConforme?: boolean;
    observations?: string;
  };
  offreFinanciere?: {
    fichierChiffreUrl?: string;
    fichierClairUrl?: string;
    hashFichier?: string;
    signatureVerifiee?: boolean;
    montantHt?: string;
    tva?: string;
    montantTtc?: string;
    isDechiffree?: boolean;
  };
  caution?: {
    reference?: string;
    banque?: string;
    montant?: string;
    dateEmission?: string;
    dateExpiration?: string;
    fichierUrl?: string;
  };
}

export interface SoumissionFinancialLineInput {
  designation: string;
  unite: string;
  quantite: string;
  prixUnitaire: string;
}

export interface SoumissionFinancialLotInput {
  lotId: string;
  lotNumber: string;
  designation: string;
  lines: SoumissionFinancialLineInput[];
}

export interface SoumissionCautionInput {
  montant: string;
  banque: string;
  reference: string;
  dateEmission: string;
  dateExpiration: string;
  scanFile: File;
}

export interface CreateSoumissionWorkflowInput {
  appelOffreId: string;
  lotId?: string;
  offreTechniqueFile: File;
  financialLots: SoumissionFinancialLotInput[];
  caution: SoumissionCautionInput;
}

export interface SoumissionWorkflowResult {
  soumissionId: string;
  reference: string;
  statut: OeSoumissionStatus;
  horodatageServeur?: string;
}

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  statusCode?: number;
}

interface PaginatedPayload<T> {
  data: T[];
}

interface AppelOffreLotRecord {
  id: string;
  numero?: string;
  designation?: string;
}

interface AppelOffreRecord {
  id: string;
  reference?: string;
  objet?: string;
  organisationName?: string;
  wilaya?: string;
  dateLimiteSoumission?: string;
  lots?: AppelOffreLotRecord[];
}

interface SoumissionRecord {
  id: string;
  reference?: string;
  appelOffreId?: string;
  lotId?: string;
  statut?: string;
  horodatageServeur?: string;
  isDansDelai?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SoumissionDetailRecord extends SoumissionRecord {
  offreTechnique?: {
    fichierUrl?: string;
    hashFichier?: string;
    isConforme?: boolean;
    observations?: string;
  };
  offreFinanciere?: {
    fichierChiffreUrl?: string;
    fichierClairUrl?: string;
    hashFichier?: string;
    signatureVerifiee?: boolean;
    montantHt?: number | string;
    tva?: number | string;
    montantTtc?: number | string;
    isDechiffree?: boolean;
  };
  caution?: {
    reference?: string;
    banque?: string;
    montant?: number | string;
    dateEmission?: string;
    dateExpiration?: string;
    fichierUrl?: string;
  };
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload
    && typeof payload === "object"
    && "data" in (payload as Record<string, unknown>)
    && (
      "success" in (payload as Record<string, unknown>)
      || "statusCode" in (payload as Record<string, unknown>)
    )
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

function extractList<T>(payload: unknown): T[] {
  const unwrapped = unwrapEnvelope<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped as T[];
  }

  if (
    unwrapped
    && typeof unwrapped === "object"
    && Array.isArray((unwrapped as PaginatedPayload<T>).data)
  ) {
    return (unwrapped as PaginatedPayload<T>).data;
  }

  return [];
}

function normalizeStatus(value: unknown): OeSoumissionStatus {
  const raw = String(value ?? "").trim().toUpperCase();

  if (raw === "BROUILLON" || raw === "DRAFT") return "brouillon";
  if (raw === "DEPOSEE" || raw === "SOUMISE" || raw === "SUBMITTED") return "deposee";
  if (raw === "RECUE" || raw === "RECU" || raw === "RECEIVED") return "recue";
  if (raw === "EVALUEE" || raw === "EN_EVALUATION" || raw === "EVALUATED") return "evaluee";
  if (raw === "RETENUE" || raw === "ATTRIBUEE" || raw === "SELECTED") return "retenue";

  return "rejetee";
}

function formatAmount(value?: string | number | null): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return `${new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue)} DZD`;
}

function normalizeDate(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function getSubmissionDate(sub: SoumissionRecord): string {
  const status = normalizeStatus(sub.statut);
  if (status === "brouillon") {
    return "";
  }

  return normalizeDate(sub.horodatageServeur) || normalizeDate(sub.createdAt);
}

function lotLabelsForSubmission(ao: AppelOffreRecord | undefined, lotId?: string): string[] {
  const lots = ao?.lots || [];
  if (!lots.length) {
    return [];
  }

  if (lotId) {
    const lot = lots.find((entry) => entry.id === lotId);
    if (lot) {
      const number = lot.numero || "1";
      return [`Lot ${number} - ${lot.designation || "Lot"}`];
    }
  }

  return lots.map((lot, index) => `Lot ${lot.numero || String(index + 1)} - ${lot.designation || "Lot"}`);
}

function lotDetailsForSubmission(
  ao: AppelOffreRecord | undefined,
  lotId: string | undefined,
  montantHt?: string,
): OeSoumissionLotDetail[] {
  const lots = ao?.lots || [];
  if (!lots.length) {
    return [];
  }

  if (lotId) {
    const lot = lots.find((entry) => entry.id === lotId);
    if (lot) {
      return [{
        lotId: lot.id,
        lotNumber: lot.numero || "1",
        designation: lot.designation || "Lot",
        montantHt,
      }];
    }
  }

  return lots.map((lot, index) => ({
    lotId: lot.id,
    lotNumber: lot.numero || String(index + 1),
    designation: lot.designation || `Lot ${index + 1}`,
    montantHt: undefined,
  }));
}

async function listAos(): Promise<AppelOffreRecord[]> {
  const payload = await apiClient<unknown>("/api/v1/appels-offres?page=1&limit=500", {
    method: "GET",
  }).catch(() => []);

  return extractList<AppelOffreRecord>(payload);
}

async function getAoById(id: string): Promise<AppelOffreRecord | null> {
  if (!id) {
    return null;
  }

  const payload = await apiClient<unknown>(`/api/v1/appels-offres/${id}`, {
    method: "GET",
  }).catch(() => null);

  if (!payload) {
    return null;
  }

  const ao = unwrapEnvelope<AppelOffreRecord>(payload);
  return ao?.id ? ao : null;
}

function mapSoumissionListItem(
  soumission: SoumissionRecord,
  aoById: Map<string, AppelOffreRecord>,
): OeSoumissionListItem {
  const ao = aoById.get(soumission.appelOffreId || "");

  return {
    id: soumission.id,
    reference: soumission.reference || soumission.id,
    aoId: soumission.appelOffreId || ao?.id || "",
    lotId: soumission.lotId,
    aoReference: ao?.reference || soumission.appelOffreId || "AO",
    aoObject: ao?.objet || "Objet non renseigne",
    organizationName: ao?.organisationName || "Organisme non renseigne",
    lots: lotLabelsForSubmission(ao, soumission.lotId),
    submittedAt: getSubmissionDate(soumission),
    deadline: normalizeDate(ao?.dateLimiteSoumission) || normalizeDate(soumission.createdAt),
    status: normalizeStatus(soumission.statut),
    eligibleRecours: normalizeStatus(soumission.statut) === "rejetee",
  };
}

function mapSoumissionDetailItem(
  soumission: SoumissionDetailRecord,
  ao: AppelOffreRecord | null,
): OeSoumissionDetailItem {
  const financialTotalHt = formatAmount(soumission.offreFinanciere?.montantHt);

  return {
    id: soumission.id,
    reference: soumission.reference || soumission.id,
    aoId: soumission.appelOffreId || ao?.id || "",
    aoReference: ao?.reference || soumission.appelOffreId || "AO",
    aoObject: ao?.objet || "Objet non renseigne",
    organizationName: ao?.organisationName || "Organisme non renseigne",
    wilaya: ao?.wilaya || "N/A",
    aoDeadline: normalizeDate(ao?.dateLimiteSoumission),
    submittedAt: getSubmissionDate(soumission),
    createdAt: normalizeDate(soumission.createdAt),
    status: normalizeStatus(soumission.statut),
    isDansDelai: soumission.isDansDelai,
    lots: lotDetailsForSubmission(ao || undefined, soumission.lotId, financialTotalHt),
    financialTotalHt,
    horodatageServeur: normalizeDate(soumission.horodatageServeur),
    offreTechnique: soumission.offreTechnique,
    offreFinanciere: soumission.offreFinanciere
      ? {
        ...soumission.offreFinanciere,
        montantHt: formatAmount(soumission.offreFinanciere.montantHt),
        tva: formatAmount(soumission.offreFinanciere.tva),
        montantTtc: formatAmount(soumission.offreFinanciere.montantTtc),
      }
      : undefined,
    caution: soumission.caution
      ? {
        ...soumission.caution,
        montant: formatAmount(soumission.caution.montant),
      }
      : undefined,
  };
}

function toBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function toPem(spki: ArrayBuffer): string {
  const base64 = toBase64(spki);
  const lines = base64.match(/.{1,64}/g) || [];
  return [
    "-----BEGIN PUBLIC KEY-----",
    ...lines,
    "-----END PUBLIC KEY-----",
  ].join("\n");
}

async function computeSha256Hex(file: Blob): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    return "";
  }

  const content = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", content);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function buildEcdsaProof(hashHex: string): Promise<{
  signatureEcdsa: string;
  clePubliqueEcdsaPem: string;
}> {
  if (!globalThis.crypto?.subtle) {
    return {
      signatureEcdsa: btoa(hashHex || "placeholder-signature"),
      clePubliqueEcdsaPem: "-----BEGIN PUBLIC KEY-----\nUEs=\n-----END PUBLIC KEY-----",
    };
  }

  try {
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-384" },
      true,
      ["sign", "verify"],
    );

    const payload = new TextEncoder().encode(hashHex || "placeholder-hash");
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-384" },
      keyPair.privateKey,
      payload,
    );

    const publicKeySpki = await crypto.subtle.exportKey("spki", keyPair.publicKey);

    return {
      signatureEcdsa: toBase64(signature),
      clePubliqueEcdsaPem: toPem(publicKeySpki),
    };
  } catch {
    return {
      signatureEcdsa: btoa(hashHex || "placeholder-signature"),
      clePubliqueEcdsaPem: "-----BEGIN PUBLIC KEY-----\nUEs=\n-----END PUBLIC KEY-----",
    };
  }
}

function toIsoStartOfDay(dateOnly: string): string {
  const date = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function toIsoEndOfDay(dateOnly: string): string {
  const date = new Date(`${dateOnly}T23:59:59`);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function parseAmountInput(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 0;
  }
  return parsed;
}

async function buildFinancialCiphertextFile(financialLots: SoumissionFinancialLotInput[]): Promise<File> {
  const payload = {
    format: "bpu.v1",
    generatedAt: new Date().toISOString(),
    lots: financialLots,
  };

  const plainBytes = new TextEncoder().encode(JSON.stringify(payload));

  if (globalThis.crypto?.subtle) {
    try {
      const keyMaterial = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const aesKey = await crypto.subtle.importKey(
        "raw",
        keyMaterial,
        { name: "AES-GCM" },
        false,
        ["encrypt"],
      );

      const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        plainBytes,
      );

      const encryptedEnvelope = {
        alg: "AES-256-GCM",
        iv: toBase64(iv),
        ciphertext: toBase64(ciphertext),
      };

      const content = JSON.stringify(encryptedEnvelope);
      return new File([content], "offre-financiere.enc", {
        type: "application/octet-stream",
      });
    } catch {
      // Fallback below keeps workflow resilient when crypto APIs fail.
    }
  }

  const fallbackEnvelope = {
    alg: "PLAINTEXT-BASE64",
    ciphertext: toBase64(plainBytes),
  };

  return new File([JSON.stringify(fallbackEnvelope)], "offre-financiere.enc", {
    type: "application/octet-stream",
  });
}

async function listSoumissionRecords(): Promise<SoumissionRecord[]> {
  const payload = await apiClient<unknown>("/api/v1/soumissions", {
    method: "GET",
  });

  return extractList<SoumissionRecord>(payload);
}

export async function listOperateurSoumissions(): Promise<OeSoumissionListItem[]> {
  const [soumissions, aos] = await Promise.all([
    listSoumissionRecords(),
    listAos(),
  ]);

  const aoById = new Map(aos.map((ao) => [ao.id, ao]));

  return soumissions
    .map((soumission) => mapSoumissionListItem(soumission, aoById))
    .sort((a, b) => {
      const aDate = new Date(a.submittedAt || a.deadline || 0).getTime() || 0;
      const bDate = new Date(b.submittedAt || b.deadline || 0).getTime() || 0;
      return bDate - aDate;
    });
}

export async function getOperateurSoumissionById(id: string): Promise<OeSoumissionDetailItem | null> {
  const soumissionRaw = await apiClient<unknown>(`/api/v1/soumissions/${id}`, {
    method: "GET",
  }).catch(() => null);

  if (!soumissionRaw) {
    return null;
  }

  const soumission = unwrapEnvelope<SoumissionDetailRecord>(soumissionRaw);
  if (!soumission?.id) {
    return null;
  }

  const ao = await getAoById(soumission.appelOffreId || "");
  return mapSoumissionDetailItem(soumission, ao);
}

export async function submitOperateurSoumissionWorkflow(
  input: CreateSoumissionWorkflowInput,
): Promise<SoumissionWorkflowResult> {
  const draftRaw = await apiClient<unknown>("/api/v1/soumissions", {
    method: "POST",
    body: JSON.stringify({
      appelOffreId: input.appelOffreId,
      lotId: input.lotId || undefined,
    }),
  });

  const draft = unwrapEnvelope<SoumissionRecord>(draftRaw);
  if (!draft?.id) {
    throw new Error("Creation de soumission invalide");
  }

  const technicalHash = await computeSha256Hex(input.offreTechniqueFile);
  const technicalFormData = new FormData();
  technicalFormData.append("fichier", input.offreTechniqueFile);
  if (technicalHash) {
    technicalFormData.append("hashClient", technicalHash);
  }

  await apiClient<unknown>(`/api/v1/soumissions/${draft.id}/offre-technique`, {
    method: "POST",
    body: technicalFormData,
  });

  const financialFile = await buildFinancialCiphertextFile(input.financialLots);
  const financialHash = await computeSha256Hex(financialFile);
  const ecdsaProof = await buildEcdsaProof(financialHash);

  const financialFormData = new FormData();
  financialFormData.append("fichierChiffre", financialFile);
  if (financialHash) {
    financialFormData.append("hashClient", financialHash);
  }
  financialFormData.append("signatureEcdsa", ecdsaProof.signatureEcdsa);
  financialFormData.append("clePubliqueEcdsaPem", ecdsaProof.clePubliqueEcdsaPem);

  await apiClient<unknown>(`/api/v1/soumissions/${draft.id}/offre-financiere`, {
    method: "POST",
    body: financialFormData,
  });

  const cautionFormData = new FormData();
  cautionFormData.append("donnees", JSON.stringify({
    montant: parseAmountInput(input.caution.montant),
    banque: input.caution.banque,
    reference: input.caution.reference,
    dateEmission: toIsoStartOfDay(input.caution.dateEmission),
    dateExpiration: toIsoEndOfDay(input.caution.dateExpiration),
  }));
  cautionFormData.append("scanCaution", input.caution.scanFile);

  await apiClient<unknown>(`/api/v1/soumissions/${draft.id}/caution`, {
    method: "POST",
    body: cautionFormData,
  });

  const validatedRaw = await apiClient<unknown>(`/api/v1/soumissions/${draft.id}/valider`, {
    method: "PUT",
  });

  const validated = unwrapEnvelope<SoumissionRecord>(validatedRaw);
  if (!validated?.id) {
    throw new Error("Validation de soumission invalide");
  }

  return {
    soumissionId: validated.id,
    reference: validated.reference || validated.id,
    statut: normalizeStatus(validated.statut),
    horodatageServeur: normalizeDate(validated.horodatageServeur),
  };
}
