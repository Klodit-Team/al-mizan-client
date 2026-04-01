"use client";

import { useCallback, useEffect, useState } from "react";

import AoListPage from "./AoListPage";
import {
  getServiceContractantTenders,
  type ServiceContractantTenderItem,
} from "@/services/dashboard";
import { toggleServiceContractantTenderStatus } from "@/services/tenders";

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
      setError("Impossible de charger les appels d'offres.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      setError("Impossible de changer le statut de cet appel d'offres.");
    }
  }, []);

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
      />
    </div>
  );
}
