import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Choose a new password",
  description: "Set a new password for your Tenant Hawk account.",
  path: "/reset-password",
  noIndex: true,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Enter the code from your email and a new password."
    >
      <ResetPasswordForm initialEmail={email} />
    </AuthShell>
  );
}
