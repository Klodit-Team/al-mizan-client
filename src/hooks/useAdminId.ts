"use client";

import { useEffect, useState } from "react";

const ADMIN_ID_KEY = "admin_id";

/**
 * Hook to manage admin ID storage in localStorage
 * Stores the admin ID securely instead of exposing it in the URL
 */
export function useAdminId() {
  const [adminId, setAdminIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem(ADMIN_ID_KEY);
      setAdminIdState(storedId);
      setIsLoading(false);
    }
  }, []);

  const setAdminId = (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_ID_KEY, id);
      setAdminIdState(id);
    }
  };

  const clearAdminId = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_ID_KEY);
      setAdminIdState(null);
    }
  };

  return {
    adminId,
    setAdminId,
    clearAdminId,
    isLoading,
  };
}
