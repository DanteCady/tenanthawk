import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { CheckEmailPanel } from "@/components/auth/CheckEmailPanel";
import { getSession } from "@/lib/session";
import { getUserAccountType } from "@/lib/onboarding/user-account";
import { isAccountType } from "@/lib/onboarding/account-type";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string; intent?: string }>;
}) {
  const session = await getSession();
  const { email, error, intent: intentParam } = await searchParams;
  const intent = isAccountType(intentParam) ? intentParam : undefined;

  const pendingEmail = email?.trim().toLowerCase();
  const sessionEmail = session?.user.email?.trim().toLowerCase();
  const sessionMatchesPending =
    !pendingEmail || !sessionEmail || sessionEmail === pendingEmail;

  if (session?.user.emailVerified && sessionMatchesPending) {
    const accountType =
      (await getUserAccountType(session.user.id)) ?? intent ?? "individual";
    redirect(accountType === "msp" ? "/onboarding/workspace" : "/onboarding");
  }

  const displayEmail = email ?? session?.user.email;

  return (
    <AuthShell
      title="Check your email"
      subtitle={
        intent === "msp"
          ? "Verify your email, then set up your MSP workspace."
          : "Verify your email with the 6-digit code we send you, then connect a tenant."
      }
    >
      <CheckEmailPanel email={displayEmail} errorCode={error} intent={intent} />
    </AuthShell>
  );
}
