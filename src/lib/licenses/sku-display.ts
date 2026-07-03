import catalog from "./sku-catalog.json";

/** Prepaid balances / credits - not per-user seat licenses. Skip "unused seat" findings. */
const CREDIT_POOL_SKUS = new Set([
  "MCOPSTNC", // Communications Credits (Teams calling / conferencing balance)
]);

/** Free or viral SKUs - huge prepaid counts, not actionable waste. */
const NOISE_UNUSED_SKUS = new Set([
  "FLOW_FREE",
  "CCIBOTS_PRIVPREV_VIRAL",
  "POWERAPPS_VIRAL",
  "TEAMS_ESSENTIALS_AAD",
  "WINDOWS_STORE",
  ...CREDIT_POOL_SKUS,
]);

export interface LicenseSkuInfo {
  /** Human-readable product name */
  label: string;
  /** Original Graph skuPartNumber */
  code: string;
  /** Short explainer when the name alone isn't enough */
  hint?: string;
  /** Prepaid credit pool - don't treat unused prepaid seats as reclaimable licenses */
  isCreditPool: boolean;
}

const SKU_NAMES: Record<string, string> = catalog;

/** Looks like a Microsoft skuPartNumber (e.g. MCOPSTNC, SPE_E3). */
export function isLicenseSkuCode(value: string): boolean {
  return /^[A-Z0-9_]{3,64}$/.test(value.trim());
}

const SKU_DISPLAY_OVERRIDES: Record<string, string> = {
  MCOPSTN1: "Teams Domestic Calling Plan",
  MCOPSTN2: "Teams Domestic & International Calling Plan",
};

const SKU_HINTS: Record<string, string> = {
  MCOPSTN1:
    "Per-user Teams phone add-on for outbound domestic calling (legacy SKU: Skype PSTN Domestic). Usually paired with Teams Phone Standard.",
  MCOPSTN2:
    "Per-user Teams phone add-on with domestic and international minutes (legacy Skype PSTN SKU).",
};

export function resolveLicenseSku(skuPartNumber: string): LicenseSkuInfo {
  const code = skuPartNumber.trim().toUpperCase();
  const label = SKU_DISPLAY_OVERRIDES[code] ?? SKU_NAMES[code] ?? formatUnknownSku(code);
  const isCreditPool = CREDIT_POOL_SKUS.has(code);

  let hint: string | undefined = SKU_HINTS[code];
  if (isCreditPool) {
    hint =
      "Prepaid balance for Teams phone and audio conferencing - not a per-user seat license.";
  } else if (!hint && !SKU_NAMES[code] && !SKU_DISPLAY_OVERRIDES[code]) {
    hint = `Microsoft internal SKU code: ${code}`;
  }

  return { label, code, hint, isCreditPool };
}

function formatUnknownSku(code: string): string {
  return `Microsoft license (${code})`;
}

export function shouldSkipUnusedSeatFinding(skuPartNumber: string): boolean {
  const code = skuPartNumber.trim().toUpperCase();
  return NOISE_UNUSED_SKUS.has(code);
}

export function formatLicenseEntityRef(entityRef: string | null | undefined): string {
  if (!entityRef) return "";
  const trimmed = entityRef.trim();
  if (!isLicenseSkuCode(trimmed)) return trimmed;
  const info = resolveLicenseSku(trimmed);
  return info.label;
}

export function formatLicenseEntityRefDetailed(
  entityRef: string | null | undefined,
): { primary: string; secondary?: string } {
  if (!entityRef) return { primary: "" };
  const trimmed = entityRef.trim();
  if (!isLicenseSkuCode(trimmed)) return { primary: trimmed };
  const info = resolveLicenseSku(trimmed);
  return {
    primary: info.label,
    secondary: SKU_NAMES[info.code] ? info.code : info.hint,
  };
}
