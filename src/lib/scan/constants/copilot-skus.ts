/** Microsoft 365 Copilot SKU part numbers (subscribedSkus.skuPartNumber). */
export const COPILOT_SKU_PART_NUMBERS = new Set([
  "MICROSOFT_365_COPILOT",
  "COPILOT_FOR_MS_365",
  "M365_COPILOT",
  "MS365_COPILOT",
  "Microsoft_365_Copilot",
]);

export function isCopilotSkuPartNumber(partNumber: string | undefined | null): boolean {
  if (!partNumber) return false;
  if (COPILOT_SKU_PART_NUMBERS.has(partNumber)) return true;
  return /copilot/i.test(partNumber);
}

/** Default $/seat/mo for ROI estimates when tenant has no custom Copilot rate. */
export const DEFAULT_COPILOT_SEAT_USD = 30;
