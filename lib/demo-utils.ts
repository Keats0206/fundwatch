/**
 * Utilities for demo mode
 */

export const DEMO_FUND_ID = "demo";

// Demo company IDs from the seed file
export const DEMO_COMPANY_IDS = [
  'airbnb',
  'coinbase',
  'stripe',
  'dropbox',
  'reddit',
  'doordash',
  'twitch',
  'gusto',
  'instacart',
  'ramp',
  'brex',
  'openai'
] as const;

export function isDemoFund(fundId: string | null | undefined): boolean {
  return fundId === DEMO_FUND_ID;
}

export function isDemoCompany(companyId: string | null | undefined): boolean {
  if (!companyId) return false;
  return (DEMO_COMPANY_IDS as readonly string[]).includes(companyId);
}

export async function isDemoCompanyAsync(companyId: string): Promise<boolean> {
  const { getCompany } = await import("./data");
  try {
    const company = await getCompany(companyId);
    return company?.fundId === DEMO_FUND_ID;
  } catch {
    return false;
  }
}
