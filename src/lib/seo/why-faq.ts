export type FaqItem = { q: string; a: string };

export const WHY_FAQ: FaqItem[] = [
  {
    q: "Doesn't Secure Score already cover this?",
    a: "Secure Score focuses on identity security recommendations. Tenant Hawk adds license waste, expiring secrets, hygiene clutter, and rolls everything into one prioritized score with dollar impact and fix steps.",
  },
  {
    q: "We already manage licenses in Admin Center.",
    a: "Admin Center shows inventory. We show waste ranked by severity and money, with remediation steps and optional contract pricing.",
  },
  {
    q: "Should we just use Microsoft Defender?",
    a: "Defender protects endpoints and advanced threats. Tenant Hawk is the tenant health check for misconfigs, waste, and expiry. It is often the layer you run alongside Defender, not instead of it.",
  },
  {
    q: "Do you modify our data?",
    a: "No. Tenant Hawk uses read-only Microsoft Graph permissions. We scan your tenant and store findings in Tenant Hawk. We never change users, licenses, policies, or settings in your Microsoft environment.",
  },
];
