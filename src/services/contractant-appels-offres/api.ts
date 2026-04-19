import {
  getServiceContractantTenderById,
  updateServiceContractantTenderStatus,
  type ServiceContractantApiStatus,
  type ServiceContractantTenderDetail,
  type ServiceContractantTenderStatus,
} from "@/services/tenders";

export type {
  ServiceContractantApiStatus,
  ServiceContractantTenderDetail,
  ServiceContractantTenderStatus,
};

export function getContractantAppelOffreById(
  id: string,
): Promise<ServiceContractantTenderDetail | null> {
  return getServiceContractantTenderById(id);
}

export function updateContractantAppelOffreStatus(
  id: string,
  status: ServiceContractantApiStatus,
): Promise<ServiceContractantTenderStatus> {
  return updateServiceContractantTenderStatus(id, status);
}
