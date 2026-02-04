const STORAGE_KEY = "fundwatch-company-overrides";

export interface CompanyOverrides {
  /** User-added tags per company (e.g. "Needs call", "Recruiting") */
  tags: Record<string, string[]>;
  /** Reassign company to this fund for display (companyId -> fundId) */
  fundAssignment: Record<string, string>;
}

const defaultOverrides: CompanyOverrides = {
  tags: {},
  fundAssignment: {},
};

function load(): CompanyOverrides {
  if (typeof window === "undefined") return defaultOverrides;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultOverrides;
    const parsed = JSON.parse(raw) as Partial<CompanyOverrides>;
    return {
      tags: { ...defaultOverrides.tags, ...parsed.tags },
      fundAssignment: { ...defaultOverrides.fundAssignment, ...parsed.fundAssignment },
    };
  } catch {
    return defaultOverrides;
  }
}

function save(overrides: CompanyOverrides): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

export function getCompanyOverrides(): CompanyOverrides {
  return load();
}

export function setCompanyTags(companyId: string, tags: string[]): void {
  const next = load();
  if (tags.length === 0) {
    const { [companyId]: _, ...rest } = next.tags;
    next.tags = rest;
  } else {
    next.tags = { ...next.tags, [companyId]: tags };
  }
  save(next);
}

export function addCompanyTag(companyId: string, tag: string): void {
  const next = load();
  const current = next.tags[companyId] ?? [];
  if (current.includes(tag)) return;
  next.tags = { ...next.tags, [companyId]: [...current, tag] };
  save(next);
}

export function removeCompanyTag(companyId: string, tag: string): void {
  const next = load();
  const current = next.tags[companyId] ?? [];
  next.tags = { ...next.tags, [companyId]: current.filter((t) => t !== tag) };
  save(next);
}

export function setCompanyFundAssignment(companyId: string, fundId: string | null): void {
  const next = load();
  if (fundId === null) {
    const { [companyId]: _, ...rest } = next.fundAssignment;
    next.fundAssignment = rest;
  } else {
    next.fundAssignment = { ...next.fundAssignment, [companyId]: fundId };
  }
  save(next);
}
