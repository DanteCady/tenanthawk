import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Start a free Microsoft 365 tenant health scan",
  description:
    "Create a free Tenant Hawk account and run a read-only scan of your Microsoft 365 tenant. See security gaps, license waste, and expiring secrets in minutes.",
  path: "/signup",
});

export default function SignupPage() {
  return (
    <AuthShell
      title="Start your free scan"
      subtitle="Create an account, enter the verification code from your email, then connect a tenant."
    >
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthShell>
  );
}
