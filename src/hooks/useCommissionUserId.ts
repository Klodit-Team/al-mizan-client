"use client";

import { useState } from "react";

const COMMISSION_USER_ID_KEY = "commission_user_id";

function setCommissionUserIdCookie(userId: string | null) {
  if (typeof document === "undefined") return;
  if (!userId) {
    document.cookie = "commission_user_id=; Path=/; Max-Age=0; SameSite=Lax";
    return;
  }
  document.cookie = `commission_user_id=${userId}; Path=/; Max-Age=604800; SameSite=Lax`;
}

/** Lazy initializer — runs once on mount, avoids setState-in-effect lint error. */
function readStoredId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COMMISSION_USER_ID_KEY);
}

/**
 * Hook to manage commission member user ID.
 * Stores the userId in localStorage (client access) and as a cookie
 * (so Next.js middleware can resolve the correct commission dashboard redirect).
 */
export function useCommissionUserId() {
  const [commissionUserId, setCommissionUserIdState] = useState<string | null>(readStoredId);

  const setCommissionUserId = (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(COMMISSION_USER_ID_KEY, id);
    }
    setCommissionUserIdState(id);
    setCommissionUserIdCookie(id);
  };

  const clearCommissionUserId = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(COMMISSION_USER_ID_KEY);
    }
    setCommissionUserIdState(null);
    setCommissionUserIdCookie(null);
  };

  return {
    commissionUserId,
    setCommissionUserId,
    clearCommissionUserId,
  };
}