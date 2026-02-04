"use client";

import { useState, useEffect, useCallback } from "react";
import type { Company, Task, SignalText } from "@/lib/types";
import * as data from "@/lib/data";

type AsyncState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
};

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
    refetch: () => {},
  });
  const [refetchCounter, setRefetchCounter] = useState(0);

  const refetch = useCallback(() => {
    setRefetchCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    fn()
      .then((data) => {
        if (!cancelled) setState((s) => ({ ...s, data, error: null, isLoading: false }));
      })
      .catch((error) => {
        if (!cancelled) setState((s) => ({ ...s, data: null, error, isLoading: false }));
      });
    return () => {
      cancelled = true;
    };
  }, [...deps, refetchCounter]);

  return { ...state, refetch };
}

export function useFunds() {
  return useAsync(() => data.getFunds(), []);
}

export function useFundById(id: string) {
  return useAsync(() => data.getFund(id), [id]);
}

export function useCompanies(fundId: string) {
  return useAsync(() => data.getCompanies(fundId), [fundId]);
}

export function useCompany(id: string | null) {
  return useAsync(() => (id ? data.getCompany(id) : Promise.resolve(undefined)), [id]);
}

export function useSignals(companyId: string | null) {
  return useAsync(() => (companyId ? data.getSignals(companyId) : Promise.resolve([])), [companyId]);
}

export function useRoles(companyId: string | null) {
  return useAsync(() => (companyId ? data.getRoles(companyId) : Promise.resolve([])), [companyId]);
}

export function usePeopleChanges(companyId: string | null) {
  return useAsync(() => (companyId ? data.getPeopleChanges(companyId) : Promise.resolve([])), [companyId]);
}

export function useAlerts(fundId: string) {
  return useAsync(() => data.getAlerts(fundId), [fundId]);
}

export function useOpenRolesForFund(fundId: string) {
  return useAsync(() => data.getOpenRolesForFund(fundId), [fundId]);
}

export function useBrief(companyId: string | null, briefId?: string) {
  return useAsync(() => (companyId ? data.getBrief(companyId, briefId) : Promise.resolve(undefined)), [companyId, briefId]);
}

export function useAllBriefs(companyId: string | null) {
  return useAsync(() => (companyId ? data.getAllBriefs(companyId) : Promise.resolve([])), [companyId]);
}

export function useAttentionCompanies(fundId: string) {
  return useAsync(() => data.getAttentionCompanies(fundId), [fundId]);
}

export function useTasks(fundId: string, status?: Task["status"]) {
  return useAsync(() => data.getTasks(fundId, status), [fundId, status]);
}

export function useTasksForCompany(companyId: string | null) {
  return useAsync(() => (companyId ? data.getTasksForCompany(companyId) : Promise.resolve([])), [companyId]);
}

export function useTrackedUrls(companyId: string | null) {
  return useAsync(() => (companyId ? data.getTrackedUrls(companyId) : Promise.resolve([])), [companyId]);
}

export function useSignalCache(companyId: string | null) {
  return useAsync(() => (companyId ? data.getSignalCache(companyId) : Promise.resolve(null)), [companyId]);
}

export function useWeeklyMotion(fundId: string | null) {
  return useAsync(() => (fundId ? data.getWeeklyMotion(fundId) : Promise.resolve(data.getWeeklyMotion(""))), [fundId]);
}

export function useSignalTexts(companyId: string | null) {
  return useAsync(() => (companyId ? data.getSignalTexts(companyId) : Promise.resolve([])), [companyId]);
}

export function useStandardSignalTexts() {
  const result = useAsync(() => data.getStandardSignalTexts(), []);
  return {
    ...result,
    refetch: () => {
      // Force re-fetch by updating the dependency
      return data.getStandardSignalTexts();
    },
  };
}
