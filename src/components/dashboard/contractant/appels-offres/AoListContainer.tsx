"use client";

import { useCallback, useEffect, useState } from "react";

import AoListPage from "./AoListPage";
import {
  getServiceContractantTenders,
  type ServiceContractantTenderItem,
} from "@/services/dashboard";
import {
  deleteServiceContractantTender,
  toggleServiceContractantTenderStatus,
} from "@/services/tenders";

interface TendersFiltersDict {
  status: string;
  all: string;
  draft: string;
  published: string;
  ongoing: string;
  evaluation: string;
  awarded: string;
  cancelled: string;
  dateStart?: string;
  dateEnd?: string;
  reset?: string;
  searchLabel?: string;
  filterByStatus?: string;
}

interface TendersTableDict {
  reference: string;
  object: string;
  type: string;
  deadline: string;
  status: string;
  actions: string;
}

interface TendersActionsDict {
  view: string;
  edit: string;
  changeStatus: string;
  delete: string;
}

interface TendersTypeDict {
  open: string;
  restricted: string;
  direct: string;
}

interface TendersListDict {
  title: string;
  createBtn: string;
  searchPlaceholder: string;
  filters: TendersFiltersDict;
  table: TendersTableDict;
  actions: TendersActionsDict;
  empty: string;
  types: TendersTypeDict;
  errors?: {
    load: string;
    changeStatus: string;
    delete: string;
  };
  pagination: {
    showing: string;
    to: string;
    of: string;
    entries: string;
    previous: string;
    next: string;
  };
  confirmDelete: string;
}

interface AoListContainerProps {
  locale: string;
  dict: TendersListDict;
}

export default function AoListContainer({
  locale,
  dict,
}: AoListContainerProps) {
  const [data, setData] = useState<ServiceContractantTenderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getServiceContractantTenders();
      setData(response);
    } catch {
      setError(dict.errors?.load || "Impossible de charger les appels d'offres.");
    } finally {
      setIsLoading(false);
    }
  }, [dict.errors?.load]);

  useEffect(() => {
    void loadTenders();
  }, [loadTenders]);

  const handleChangeStatus = useCallback(async (id: string) => {
    try {
      const nextStatus = await toggleServiceContractantTenderStatus(id);
      setData((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: nextStatus } : item,
        ),
      );
    } catch {
      setError(dict.errors?.changeStatus || "Impossible de changer le statut de cet appel d'offres.");
    }
  }, [dict.errors?.changeStatus]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteServiceContractantTender(id);
      setData((current) => current.filter((item) => item.id !== id));
    } catch {
      setError(dict.errors?.delete || "Impossible de supprimer cet appel d'offres.");
    }
  }, [dict.errors?.delete]);

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <AoListPage
        locale={locale}
        dict={dict}
        data={data}
        isLoading={isLoading}
        onChangeStatus={handleChangeStatus}
        onDelete={handleDelete}
      />
    </div>
  );
}
