"use client";

import { useCallback, useEffect, useState } from "react";

import GreAGreListPage from "./GreAGreListPage";
import {
  listServiceContractantGreAGreRequests,
  type ServiceContractantGreAGreRequestItem,
} from "@/services/greAGre";

interface GreAGreListContainerProps {
  locale: string;
  dict: any;
}

export default function GreAGreListContainer({
  locale,
  dict,
}: GreAGreListContainerProps) {
  const [data, setData] = useState<ServiceContractantGreAGreRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listServiceContractantGreAGreRequests();
      setData(response);
    } catch {
      setError(dict?.errorLoading || "Impossible de charger les demandes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <GreAGreListPage locale={locale} data={data} isLoading={isLoading} dict={dict} />
    </div>
  );
}
