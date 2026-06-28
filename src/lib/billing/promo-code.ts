export function normalizePromoCode(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const code = raw.trim().toUpperCase();
  return code.length > 0 ? code : undefined;
}
