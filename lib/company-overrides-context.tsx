"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { CompanyOverrides } from "./company-overrides";
import {
  getCompanyOverrides,
  setCompanyTags as persistTags,
  addCompanyTag as persistAddTag,
  removeCompanyTag as persistRemoveTag,
  setCompanyFundAssignment as persistFundAssignment,
} from "./company-overrides";

export { getCompanyOverrides };

type CompanyOverridesContextValue = {
  overrides: CompanyOverrides;
  setCompanyTags: (companyId: string, tags: string[]) => void;
  addCompanyTag: (companyId: string, tag: string) => void;
  removeCompanyTag: (companyId: string, tag: string) => void;
  setCompanyFundAssignment: (companyId: string, fundId: string | null) => void;
  refresh: () => void;
};

const CompanyOverridesContext = createContext<CompanyOverridesContextValue | null>(null);

export function CompanyOverridesProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<CompanyOverrides>(() =>
    typeof window === "undefined" ? { tags: {}, fundAssignment: {} } : getCompanyOverrides()
  );

  const refresh = useCallback(() => {
    setOverrides(getCompanyOverrides());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOverrides(getCompanyOverrides());
  }, []);

  const setCompanyTags = useCallback((companyId: string, tags: string[]) => {
    persistTags(companyId, tags);
    setOverrides(getCompanyOverrides());
  }, []);

  const addCompanyTag = useCallback((companyId: string, tag: string) => {
    persistAddTag(companyId, tag);
    setOverrides(getCompanyOverrides());
  }, []);

  const removeCompanyTag = useCallback((companyId: string, tag: string) => {
    persistRemoveTag(companyId, tag);
    setOverrides(getCompanyOverrides());
  }, []);

  const setCompanyFundAssignment = useCallback((companyId: string, fundId: string | null) => {
    persistFundAssignment(companyId, fundId);
    setOverrides(getCompanyOverrides());
  }, []);

  const value: CompanyOverridesContextValue = {
    overrides,
    setCompanyTags,
    addCompanyTag,
    removeCompanyTag,
    setCompanyFundAssignment,
    refresh,
  };

  return (
    <CompanyOverridesContext.Provider value={value}>
      {children}
    </CompanyOverridesContext.Provider>
  );
}

export function useCompanyOverrides(): CompanyOverridesContextValue {
  const ctx = useContext(CompanyOverridesContext);
  if (!ctx) throw new Error("useCompanyOverrides must be used within CompanyOverridesProvider");
  return ctx;
}
