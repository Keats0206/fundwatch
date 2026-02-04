/**
 * Per-fund credentials. Relatively unsecure (plaintext comparison) — suitable
 * for sharing different data sets with different funds via username/password.
 *
 * Configure via env: FUND_CREDENTIALS (JSON array)
 * Example:
 * [{"fundId":"mantis","username":"mantis","password":"..."},{"fundId":"thrive","username":"thrive","password":"..."}]
 */

export type FundCredential = {
  fundId: string;
  username: string;
  password: string;
};

const COOKIE_NAME = "fundwatch_fund";

function getCredentials(): FundCredential[] {
  const raw = process.env.FUND_CREDENTIALS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FundCredential[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Validate username/password and return fundId if valid. */
export function validateCredentials(
  username: string,
  password: string
): string | null {
  const credentials = getCredentials();
  const match = credentials.find(
    (c) =>
      c.username === username && c.password === password
  );
  return match?.fundId ?? null;
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

/** Read fundId from cookie string (e.g. from request headers). */
export function getFundIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim();
  if (!value) return null;
  return validateFundId(value) ? value : null;
}

/** Check if fundId is one of the configured credential fund IDs. */
export function validateFundId(fundId: string): boolean {
  const credentials = getCredentials();
  return credentials.some((c) => c.fundId === fundId);
}

/** True when FUND_CREDENTIALS is set and non-empty (auth required). */
export function isAuthEnabled(): boolean {
  return getCredentials().length > 0;
}
