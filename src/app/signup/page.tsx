import { SignupPageClient } from "@/components/auth/SignupPageClient";
import { accountTypeFromSearchParam } from "@/lib/onboarding/account-type";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Start a free Microsoft 365 tenant health scan",
  description:
    "Create a free Tenant Hawk account and run a read-only scan of your Microsoft 365 tenant. See security gaps, license waste, and expiring secrets in minutes.",
  path: "/signup",
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
