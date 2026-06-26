/** Cached AI remediation (stored on finding.remediation_enriched). */
export interface RemediationEnriched {
  steps: string[];
  links: Array<{ title: string; url: string }>;
  generatedAt: string;
  model: string;
}

export interface RemediationDocLink {
  title: string;
  url: string;
}
