function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.EMAIL_APP_URL,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;
    if (trimmed.includes("localhost")) {
      return "https://tenanthawk.io";
    }
    return trimmed.replace(/\/$/, "");
  }

  return "https://tenanthawk.io";
}

export function getSiteUrl(): string {
  return resolveSiteUrl();
}
