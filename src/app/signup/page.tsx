import { SignupPageClient } from "@/components/auth/SignupPageClient";
import { accountTypeFromSearchParam } from "@/lib/onboarding/account-type";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Start a free M365 tenant cleanup scan",
  description:
    "Create a free Tenant Hawk account and run a read-only Microsoft 365 cleanup scan. See inactive users, unused licenses, security gaps, and hygiene issues in minutes.",
  path: "/signup",
  noIndex: true,
});

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; intent?: string }>;
}) {
  const { type, intent } = await searchParams;
  const initialAccountType = accountTypeFromSearchParam(type, intent);

  return <SignupPageClient initialAccountType={initialAccountType} />;
}
