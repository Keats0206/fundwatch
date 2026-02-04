"use client";

import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react";
import { getCookieName } from "./auth";
import { useFunds, useFundById } from "./hooks/use-data";
import type { Fund } from "./types";

function getFundIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const name = getCookieName();
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1]?.trim() ?? null;
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
    const fromCookie = getFundIdFromCookie();
    if (fromCookie) {
      setFundId(fromCookie);
      setLockedToFund(true);
      return;
    }
    if (funds?.length && !fundId) setFundId(funds[0].id);
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
