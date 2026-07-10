import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { TwoFactorVerifyForm } from "@/components/auth/TwoFactorVerifyForm";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Two-factor authentication",
  description: "Complete Tenant Hawk sign-in with two-factor authentication.",
  path: "/two-factor",
  noIndex: true,
});

export default function TwoFactorPage() {
  return (
    <AuthShell
      title="Two-factor authentication"
      subtitle="Complete sign-in with your authenticator app."
    >
      <Suspense fallback={null}>
        <TwoFactorVerifyForm />
      </Suspense>
    </AuthShell>
  );
}
