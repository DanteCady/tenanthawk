export const ACCOUNT_TYPES = ["individual", "msp"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_INTENT_STORAGE_KEY = "th_account_intent";

export function isAccountType(value: string | null | undefined): value is AccountType {
  return value === "individual" || value === "msp";
}

/** Resolve signup intent from `type` or `intent` query params (SSR-safe). */
export function accountTypeFromSearchParam(
  ...values: (string | null | undefined)[]
): AccountType {
  for (const raw of values) {
    if (raw === "msp") return "msp";
  }
  return "individual";
}

export function persistAccountIntent(type: AccountType) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACCOUNT_INTENT_STORAGE_KEY, type);
}

export function readAccountIntent(): AccountType | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ACCOUNT_INTENT_STORAGE_KEY);
  return isAccountType(raw) ? raw : null;
}

export function clearAccountIntent() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACCOUNT_INTENT_STORAGE_KEY);
}
