"use client";

import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react";
import { useFunds, useFundById } from "./hooks/use-data";
import type { Fund } from "./types";

// Since we use httpOnly cookies, we can't read them client-side
// The fund ID will be determined server-side via middleware
// For client-side, we'll fetch it from an API endpoint if needed
async function getFundIdFromServer(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      return data.fundId ?? null;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

type FundContextValue = {
  fundId: string;
  setFundId: (id: string) => void;
  fund: Fund | null;
  /** True when user logged in (fund from cookie) — hide fund switcher. */
  lockedToFund: boolean;
  fundsLoading: boolean;
};

const FundContext = createContext<FundContextValue | null>(null);

export function FundProvider({ children }: { children: ReactNode }) {
  const { data: funds, isLoading: fundsLoading } = useFunds();
  const [fundId, setFundId] = useState("");
  const [lockedToFund, setLockedToFund] = useState(false);
  const { data: fund } = useFundById(fundId);

  useEffect(() => {
    // Check if user is authenticated (has valid cookie)
    getFundIdFromServer().then((fromServer) => {
      if (fromServer) {
        setFundId(fromServer);
        setLockedToFund(true);
        return;
      }
      // If no auth, use first available fund (for dev/demo mode)
      if (funds?.length && !fundId) setFundId(funds[0].id);
    });
  }, [funds, fundId]);

  const value: FundContextValue = useMemo(
    () => ({ fundId, setFundId, fund: fund ?? null, lockedToFund, fundsLoading }),
    [fundId, fund, lockedToFund, fundsLoading]
  );

  return <FundContext.Provider value={value}>{children}</FundContext.Provider>;
}

export function useFund(): FundContextValue {
  const ctx = useContext(FundContext);
  if (!ctx) throw new Error("useFund must be used within FundProvider");
  return ctx;
}
