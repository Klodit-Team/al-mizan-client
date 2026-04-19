"use client";

import { useCallback, useEffect, useState } from "react";

import MarchesListPage from "./MarchesListPage";
import {
  listServiceContractantMarches,
  type ServiceContractantMarcheListItem,
} from "@/services/tenderMarches";

interface MarchesListContainerProps {
  locale: string;
}

export default function MarchesListContainer({
  locale,
}: MarchesListContainerProps) {
  const [rows, setRows] = useState<ServiceContractantMarcheListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listServiceContractantMarches();
      setRows(response);
    } catch {
      setError("Impossible de charger les marches.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <MarchesListPage locale={locale} data={rows} isLoading={isLoading} />
    </div>
  );
}
