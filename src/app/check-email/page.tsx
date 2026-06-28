import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { CheckEmailPanel } from "@/components/auth/CheckEmailPanel";
import { getSession } from "@/lib/session";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session?.user.emailVerified) redirect("/onboarding");

  const { email, error } = await searchParams;
  const displayEmail = email ?? session?.user.email;

  return (
    <AuthShell
      title="Check your email"
      subtitle="Verify your email with the 6-digit code we send you, then connect a tenant."
    >
      <CheckEmailPanel email={displayEmail} errorCode={error} />
    </AuthShell>
  );
}
