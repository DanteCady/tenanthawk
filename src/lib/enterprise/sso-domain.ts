import { SSO_DOMAIN_VERIFICATION_TOKEN_PREFIX } from "./config";

/** DNS label Better Auth uses to store the verification token (RFC 8552). */
export function ssoDomainVerificationIdentifier(providerId: string): string {
  return `_${SSO_DOMAIN_VERIFICATION_TOKEN_PREFIX}-${providerId}`;
}

/** Full TXT record host, e.g. `_tenanthawk-token-acme-sso.acmecorp.com`. */
export function ssoDomainVerificationDnsHost(domain: string, providerId: string): string {
  const normalized = domain.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
  return `${ssoDomainVerificationIdentifier(providerId)}.${normalized}`;
}

/** TXT record value accepted by Better Auth domain verification. */
export function ssoDomainVerificationTxtValue(providerId: string, token: string): string {
  const identifier = ssoDomainVerificationIdentifier(providerId);
  return `${identifier}=${token}`;
}
