/** Fixed locale - safe for SSR and client hydration. */
export function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US");
}
