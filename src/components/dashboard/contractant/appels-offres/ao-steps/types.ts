import type { UseMutationResult } from "@tanstack/react-query";
import type { GenerateCdcDraftPayload, GenerateCdcDraftResponse } from "@/services/contractant-tenders/api";

export interface AiCdcSection {
  id: string;
  sectionKey: string;
  section: string;
  contenu: string;
  generatedAt: string;
  updatedAt: string;
}

export type WizardStepProps = Record<string, any> & {
  generateCdcDraftMutation?: UseMutationResult<GenerateCdcDraftResponse, Error, GenerateCdcDraftPayload, unknown>;
  draftId?: string;
};
